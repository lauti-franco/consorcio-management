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
const types_1 = require("../common/types");
let ExpensesService = class ExpensesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createExpenseDto, userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (user.role !== types_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('Only admins can create expenses');
        }
        return this.prisma.expense.create({
            data: {
                ...createExpenseDto,
                dueDate: new Date(createExpenseDto.dueDate),
            },
            include: {
                building: true,
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
    async findAll(userId, userRole, buildingId) {
        const where = {};
        if (userRole === types_1.UserRole.RESIDENT) {
            where.buildingId = buildingId;
        }
        else if (userRole === types_1.UserRole.ADMIN && buildingId) {
            where.buildingId = buildingId;
        }
        return this.prisma.expense.findMany({
            where,
            include: {
                building: true,
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
    async findOne(id, userId, userRole, buildingId) {
        const expense = await this.prisma.expense.findUnique({
            where: { id },
            include: {
                building: true,
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
            throw new common_1.NotFoundException('Expense not found');
        }
        if (userRole === types_1.UserRole.RESIDENT && expense.buildingId !== buildingId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return expense;
    }
    async update(id, updateExpenseDto, userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (user.role !== types_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('Only admins can update expenses');
        }
        try {
            return await this.prisma.expense.update({
                where: { id },
                data: updateExpenseDto,
                include: {
                    building: true,
                    payments: true,
                },
            });
        }
        catch {
            throw new common_1.NotFoundException('Expense not found');
        }
    }
    async remove(id, userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (user.role !== types_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('Only admins can delete expenses');
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
    async getStats(buildingId) {
        const where = buildingId ? { buildingId } : {};
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