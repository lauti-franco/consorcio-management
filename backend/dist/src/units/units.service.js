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
exports.UnitsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UnitsService = class UnitsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createUnitDto, userId) {
        const property = await this.prisma.property.findFirst({
            where: {
                id: createUnitDto.propertyId,
                ownerId: userId,
                tenantId: createUnitDto.tenantId
            },
        });
        if (!property) {
            throw new common_1.ForbiddenException('No tienes permisos para agregar unidades a esta propiedad en este tenant');
        }
        if (createUnitDto.managerId) {
            const managerTenant = await this.prisma.userTenant.findUnique({
                where: {
                    userId_tenantId: {
                        userId: createUnitDto.managerId,
                        tenantId: createUnitDto.tenantId
                    }
                }
            });
            if (!managerTenant) {
                throw new common_1.ForbiddenException('El manager asignado no tiene acceso a este tenant');
            }
        }
        return this.prisma.unit.create({
            data: {
                number: createUnitDto.number,
                floor: createUnitDto.floor,
                type: createUnitDto.type,
                area: createUnitDto.area,
                bedrooms: createUnitDto.bedrooms,
                bathrooms: createUnitDto.bathrooms,
                isOccupied: createUnitDto.isOccupied || false,
                features: createUnitDto.features || [],
                propertyId: createUnitDto.propertyId,
                tenantId: createUnitDto.tenantId,
                managerId: createUnitDto.managerId,
            },
            include: {
                property: {
                    select: {
                        id: true,
                        name: true,
                        address: true
                    }
                },
                manager: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }
    async findAll(propertyId, userId, tenantId) {
        const property = await this.prisma.property.findFirst({
            where: {
                id: propertyId,
                tenantId: tenantId,
                OR: [
                    { ownerId: userId },
                    { units: { some: { managerId: userId } } }
                ]
            },
        });
        if (!property) {
            throw new common_1.ForbiddenException('No tienes permisos para ver las unidades de esta propiedad en este tenant');
        }
        return this.prisma.unit.findMany({
            where: {
                propertyId,
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
                manager: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                _count: {
                    select: {
                        expenses: {
                            where: { tenantId: tenantId }
                        },
                        payments: {
                            where: { tenantId: tenantId }
                        },
                        tickets: {
                            where: { tenantId: tenantId }
                        },
                    },
                },
            },
            orderBy: { floor: 'asc' },
        });
    }
    async findOne(id, userId, tenantId) {
        const unit = await this.prisma.unit.findFirst({
            where: {
                id,
                tenantId,
                OR: [
                    { property: { ownerId: userId, tenantId: tenantId } },
                    { managerId: userId },
                    { property: { ownerId: userId, tenantId: tenantId } }
                ]
            },
            include: {
                property: {
                    select: {
                        id: true,
                        name: true,
                        address: true
                    }
                },
                manager: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
                expenses: {
                    where: { tenantId: tenantId },
                    take: 5,
                    orderBy: { dueDate: 'desc' },
                },
                payments: {
                    where: { tenantId: tenantId },
                    take: 10,
                    orderBy: { date: 'desc' },
                    include: {
                        expense: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
                tickets: {
                    where: { tenantId: tenantId },
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!unit) {
            throw new common_1.NotFoundException('Unit not found or no access in this tenant');
        }
        return unit;
    }
    async update(id, updateUnitDto, userId, tenantId) {
        await this.verifyUnitAccess(id, userId, tenantId);
        if (updateUnitDto.managerId) {
            const managerTenant = await this.prisma.userTenant.findUnique({
                where: {
                    userId_tenantId: {
                        userId: updateUnitDto.managerId,
                        tenantId: tenantId
                    }
                }
            });
            if (!managerTenant) {
                throw new common_1.ForbiddenException('El manager asignado no tiene acceso a este tenant');
            }
        }
        return this.prisma.unit.update({
            where: { id },
            data: {
                number: updateUnitDto.number,
                floor: updateUnitDto.floor,
                type: updateUnitDto.type,
                area: updateUnitDto.area,
                bedrooms: updateUnitDto.bedrooms,
                bathrooms: updateUnitDto.bathrooms,
                isOccupied: updateUnitDto.isOccupied,
                features: updateUnitDto.features || undefined,
                managerId: updateUnitDto.managerId,
            },
            include: {
                property: {
                    select: {
                        id: true,
                        name: true,
                        address: true
                    }
                },
                manager: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }
    async remove(id, userId, tenantId) {
        await this.verifyUnitAccess(id, userId, tenantId);
        return this.prisma.unit.delete({
            where: { id },
        });
    }
    async getUnitStats(id, userId, tenantId) {
        await this.verifyUnitAccess(id, userId, tenantId);
        const [currentExpenses, paymentHistory, activeTickets] = await Promise.all([
            this.prisma.expense.findMany({
                where: {
                    unitId: id,
                    tenantId: tenantId,
                    status: { in: ['OPEN', 'OVERDUE'] },
                },
                include: {
                    payments: {
                        where: {
                            unitId: id,
                            tenantId: tenantId,
                        },
                    },
                },
            }),
            this.prisma.payment.findMany({
                where: {
                    unitId: id,
                    tenantId: tenantId,
                    status: 'COMPLETED',
                },
                orderBy: { date: 'desc' },
                take: 6,
            }),
            this.prisma.ticket.count({
                where: {
                    unitId: id,
                    tenantId: tenantId,
                    status: { in: ['OPEN', 'IN_PROGRESS'] },
                },
            }),
        ]);
        const totalDue = currentExpenses.reduce((sum, expense) => {
            const paidAmount = expense.payments.reduce((paid, payment) => paid + payment.amount, 0);
            return sum + (expense.amount - paidAmount);
        }, 0);
        return {
            totalDue,
            activeTickets,
            paymentHistory,
            currentExpenses: currentExpenses.map(expense => ({
                ...expense,
                paidAmount: expense.payments.reduce((sum, payment) => sum + payment.amount, 0),
                remaining: expense.amount - expense.payments.reduce((sum, payment) => sum + payment.amount, 0),
            })),
        };
    }
    async verifyUnitAccess(unitId, userId, tenantId) {
        const unit = await this.prisma.unit.findFirst({
            where: {
                id: unitId,
                tenantId: tenantId,
                property: {
                    ownerId: userId,
                    tenantId: tenantId
                }
            },
        });
        if (!unit) {
            throw new common_1.ForbiddenException('No tienes permisos para modificar esta unidad en este tenant');
        }
        return unit;
    }
};
exports.UnitsService = UnitsService;
exports.UnitsService = UnitsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UnitsService);
//# sourceMappingURL=units.service.js.map