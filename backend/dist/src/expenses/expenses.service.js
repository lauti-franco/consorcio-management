"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpensesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ExpensesService = class ExpensesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createExpenseDto, userId) {
        const userTenant = await this.prisma.userTenant.findUnique({
            where: {
                userId_tenantId: {
                    userId: userId,
                    tenantId: createExpenseDto.tenantId
                }
            }
        });
        if (!userTenant || userTenant.role !== client_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('Only admins can create expenses in this tenant');
        }
        const property = await this.prisma.property.findFirst({
            where: {
                id: createExpenseDto.propertyId,
                tenantId: createExpenseDto.tenantId
            }
        });
        if (!property) {
            throw new common_1.ForbiddenException('Property not found in this tenant');
        }
        if (createExpenseDto.unitId) {
            const unit = await this.prisma.unit.findFirst({
                where: {
                    id: createExpenseDto.unitId,
                    propertyId: createExpenseDto.propertyId,
                    tenantId: createExpenseDto.tenantId
                }
            });
            if (!unit) {
                throw new common_1.ForbiddenException('Unit not found in this property and tenant');
            }
        }
        return this.prisma.expense.create({
            data: {
                concept: createExpenseDto.concept,
                amount: createExpenseDto.amount,
                dueDate: new Date(createExpenseDto.dueDate),
                period: createExpenseDto.period,
                type: createExpenseDto.type,
                status: createExpenseDto.status || 'OPEN',
                propertyId: createExpenseDto.propertyId,
                unitId: createExpenseDto.unitId,
                userId: userId,
                tenantId: createExpenseDto.tenantId,
            },
            include: {
                property: {
                    select: {
                        id: true,
                        name: true,
                        address: true
                    }
                },
                unit: {
                    select: {
                        id: true,
                        number: true,
                        floor: true
                    }
                },
                payments: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });
    }
    async findAll(userId, userRole, tenantId, propertyId) {
        const where = { tenantId };
        if (propertyId) {
            where.propertyId = propertyId;
        }
        if (userRole === client_1.UserRole.RESIDENT) {
            const userUnits = await this.prisma.unit.findMany({
                where: {
                    managerId: userId,
                    tenantId: tenantId
                },
                select: { id: true }
            });
            where.unitId = {
                in: userUnits.map(unit => unit.id)
            };
        }
        if (userRole === client_1.UserRole.MAINTENANCE) {
            const maintenanceProperties = await this.prisma.property.findMany({
                where: {
                    tenantId: tenantId,
                    tickets: {
                        some: {
                            assignedToId: userId
                        }
                    }
                },
                select: { id: true }
            });
            where.propertyId = {
                in: maintenanceProperties.map(prop => prop.id)
            };
        }
        return this.prisma.expense.findMany({
            where,
            include: {
                property: {
                    select: {
                        id: true,
                        name: true,
                        address: true
                    }
                },
                unit: {
                    select: {
                        id: true,
                        number: true,
                        floor: true
                    }
                },
                payments: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                dueDate: 'desc',
            },
        });
    }
    async findOne(id, userId, userRole, tenantId) {
        const expense = await this.prisma.expense.findFirst({
            where: {
                id,
                tenantId
            },
            include: {
                property: {
                    select: {
                        id: true,
                        name: true,
                        address: true
                    }
                },
                unit: {
                    select: {
                        id: true,
                        number: true,
                        floor: true
                    }
                },
                payments: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });
        if (!expense) {
            throw new common_1.NotFoundException('Expense not found in this tenant');
        }
        if (userRole === client_1.UserRole.RESIDENT) {
            const userUnit = await this.prisma.unit.findFirst({
                where: {
                    id: expense.unitId,
                    managerId: userId,
                    tenantId: tenantId
                }
            });
            if (!userUnit) {
                throw new common_1.ForbiddenException('Access denied to this expense');
            }
        }
        return expense;
    }
    async update(id, updateExpenseDto, userId, tenantId) {
        const userTenant = await this.prisma.userTenant.findUnique({
            where: {
                userId_tenantId: {
                    userId: userId,
                    tenantId: tenantId
                }
            }
        });
        if (!userTenant || userTenant.role !== client_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('Only admins can update expenses in this tenant');
        }
        const existingExpense = await this.prisma.expense.findFirst({
            where: {
                id,
                tenantId
            }
        });
        if (!existingExpense) {
            throw new common_1.NotFoundException('Expense not found in this tenant');
        }
        try {
            return await this.prisma.expense.update({
                where: { id },
                data: updateExpenseDto,
                include: {
                    property: {
                        select: {
                            id: true,
                            name: true,
                            address: true
                        }
                    },
                    unit: {
                        select: {
                            id: true,
                            number: true,
                            floor: true
                        }
                    },
                    payments: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                },
                            },
                        },
                    },
                },
            });
        }
        catch {
            throw new common_1.NotFoundException('Expense not found');
        }
    }
    async remove(id, userId, tenantId) {
        const userTenant = await this.prisma.userTenant.findUnique({
            where: {
                userId_tenantId: {
                    userId: userId,
                    tenantId: tenantId
                }
            }
        });
        if (!userTenant || userTenant.role !== client_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('Only admins can delete expenses in this tenant');
        }
        const existingExpense = await this.prisma.expense.findFirst({
            where: {
                id,
                tenantId
            }
        });
        if (!existingExpense) {
            throw new common_1.NotFoundException('Expense not found in this tenant');
        }
        try {
            return await this.prisma.expense.delete({
                where: { id },
            });
        }
        catch {
            throw new common_1.NotFoundException('Expense not found');
        }
    }
    async getStats(tenantId, propertyId) {
        const where = { tenantId };
        if (propertyId) {
            where.propertyId = propertyId;
        }
        const total = await this.prisma.expense.count({ where });
        const open = await this.prisma.expense.count({ where: { ...where, status: 'OPEN' } });
        const paid = await this.prisma.expense.count({ where: { ...where, status: 'PAID' } });
        const overdue = await this.prisma.expense.count({ where: { ...where, status: 'OVERDUE' } });
        const totalAmount = await this.prisma.expense.aggregate({
            where,
            _sum: { amount: true },
        });
        const paidAmount = await this.prisma.expense.aggregate({
            where: { ...where, status: 'PAID' },
            _sum: { amount: true },
        });
        return {
            total,
            open,
            paid,
            overdue,
            totalAmount: totalAmount._sum.amount || 0,
            paidAmount: paidAmount._sum.amount || 0,
            pendingAmount: (totalAmount._sum.amount || 0) - (paidAmount._sum.amount || 0),
        };
    }
};
exports.ExpensesService = ExpensesService;
exports.ExpensesService = ExpensesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExpensesService);
//# sourceMappingURL=expenses.service.js.map