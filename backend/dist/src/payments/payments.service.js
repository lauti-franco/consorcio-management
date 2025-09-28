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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let PaymentsService = class PaymentsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createPaymentDto, userId) {
        const expense = await this.prisma.expense.findUnique({
            where: { id: createPaymentDto.expenseId },
            include: { unit: true },
        });
        if (!expense) {
            throw new common_1.NotFoundException('Expense not found');
        }
        if (!expense.unitId) {
            throw new common_1.NotFoundException('Expense must be associated with a unit');
        }
        return this.prisma.payment.create({
            data: {
                amount: createPaymentDto.amount,
                method: createPaymentDto.method,
                status: client_1.PaymentStatus.COMPLETED,
                expenseId: createPaymentDto.expenseId,
                userId: userId,
                unitId: expense.unitId,
                date: new Date(),
            },
            include: {
                expense: {
                    include: {
                        building: true,
                        unit: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                unit: {
                    select: {
                        id: true,
                        number: true,
                        building: true,
                    },
                },
            },
        });
    }
    async findAll(userId, userRole, buildingId) {
        const where = {};
        if (userRole === client_1.UserRole.RESIDENT) {
            where.unit = {
                managerId: userId,
            };
        }
        else if (userRole === client_1.UserRole.ADMIN) {
            if (buildingId) {
                where.expense = {
                    buildingId: buildingId,
                };
            }
            else {
                where.expense = {
                    building: {
                        ownerId: userId,
                    },
                };
            }
        }
        return this.prisma.payment.findMany({
            where,
            include: {
                expense: {
                    include: {
                        building: true,
                        unit: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                unit: {
                    select: {
                        id: true,
                        number: true,
                        building: true,
                    },
                },
            },
            orderBy: {
                date: 'desc',
            },
        });
    }
    async findOne(id, userId, userRole) {
        const payment = await this.prisma.payment.findUnique({
            where: { id },
            include: {
                expense: {
                    include: {
                        building: true,
                        unit: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                unit: {
                    select: {
                        id: true,
                        number: true,
                        building: true,
                    },
                },
            },
        });
        if (!payment) {
            throw new common_1.NotFoundException('Payment not found');
        }
        await this.verifyPaymentAccess(payment, userId, userRole);
        return payment;
    }
    async processPayment(processPaymentDto, userId) {
        const expense = await this.prisma.expense.findUnique({
            where: { id: processPaymentDto.expenseId },
            include: { unit: true },
        });
        if (!expense) {
            throw new common_1.NotFoundException('Expense not found');
        }
        if (!expense.unitId) {
            throw new common_1.NotFoundException('Expense must be associated with a unit');
        }
        const unitAccess = await this.prisma.unit.findFirst({
            where: {
                id: expense.unitId,
                managerId: userId,
            },
        });
        if (!unitAccess) {
            throw new common_1.ForbiddenException('No tienes permisos para pagar esta expensa');
        }
        const paymentResult = await this.simulatePayment(processPaymentDto);
        const payment = await this.prisma.payment.create({
            data: {
                amount: expense.amount,
                method: processPaymentDto.paymentMethod,
                status: client_1.PaymentStatus.COMPLETED,
                expenseId: processPaymentDto.expenseId,
                userId: userId,
                unitId: expense.unitId,
                date: new Date(),
                transactionId: paymentResult.transactionId,
                receiptUrl: paymentResult.receiptUrl,
            },
            include: {
                expense: {
                    include: {
                        building: true,
                        unit: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                unit: {
                    select: {
                        id: true,
                        number: true,
                        building: true,
                    },
                },
            },
        });
        await this.updateExpenseStatus(expense.id);
        return payment;
    }
    async getPaymentStats(userId, userRole, buildingId) {
        const where = {};
        if (userRole === client_1.UserRole.RESIDENT) {
            where.unit = {
                managerId: userId,
            };
        }
        else if (userRole === client_1.UserRole.ADMIN) {
            if (buildingId) {
                where.expense = {
                    buildingId: buildingId,
                };
            }
            else {
                where.expense = {
                    building: {
                        ownerId: userId,
                    },
                };
            }
        }
        const [totalPayments, totalAmount, monthlyRevenue] = await Promise.all([
            this.prisma.payment.count({ where }),
            this.prisma.payment.aggregate({
                where,
                _sum: { amount: true },
            }),
            this.prisma.payment.aggregate({
                where: {
                    ...where,
                    date: {
                        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                    },
                },
                _sum: { amount: true },
            }),
        ]);
        return {
            totalPayments,
            totalAmount: totalAmount._sum.amount || 0,
            monthlyRevenue: monthlyRevenue._sum.amount || 0,
        };
    }
    async simulatePayment(processPaymentDto) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
            success: true,
            transactionId: `tx_${Date.now()}`,
            receiptUrl: `https://example.com/receipts/${Date.now()}`,
        };
    }
    async updateExpenseStatus(expenseId) {
        const expense = await this.prisma.expense.findUnique({
            where: { id: expenseId },
            include: { payments: true },
        });
        if (!expense)
            return;
        const totalPaid = expense.payments.reduce((sum, payment) => sum + payment.amount, 0);
        if (totalPaid >= expense.amount) {
            await this.prisma.expense.update({
                where: { id: expenseId },
                data: { status: 'PAID' },
            });
        }
        else if (totalPaid > 0) {
            await this.prisma.expense.update({
                where: { id: expenseId },
                data: { status: 'OPEN' },
            });
        }
    }
    async verifyPaymentAccess(payment, userId, userRole) {
        if (userRole === client_1.UserRole.ADMIN) {
            const building = await this.prisma.building.findFirst({
                where: {
                    id: payment.expense.buildingId,
                    ownerId: userId,
                },
            });
            if (!building) {
                throw new common_1.ForbiddenException('Access denied');
            }
            return true;
        }
        if (userRole === client_1.UserRole.RESIDENT) {
            if (payment.unit.managerId !== userId) {
                throw new common_1.ForbiddenException('Access denied');
            }
            return true;
        }
        throw new common_1.ForbiddenException('Access denied');
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map