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
const types_1 = require("../common/types");
let PaymentsService = class PaymentsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createPaymentDto, userId) {
        const expense = await this.prisma.expense.findUnique({
            where: { id: createPaymentDto.expenseId },
        });
        if (!expense) {
            throw new common_1.NotFoundException('Expense not found');
        }
        return this.prisma.payment.create({
            data: {
                ...createPaymentDto,
                userId,
                date: new Date(),
            },
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
        });
    }
    async findAll(userId, userRole, buildingId) {
        const where = {};
        if (userRole === types_1.UserRole.RESIDENT) {
            where.userId = userId;
        }
        else if (userRole === types_1.UserRole.ADMIN && buildingId) {
            where.expense = {
                buildingId: buildingId,
            };
        }
        return this.prisma.payment.findMany({
            where,
            include: {
                expense: {
                    include: {
                        building: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
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
                    },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
        if (!payment) {
            throw new common_1.NotFoundException('Payment not found');
        }
        if (userRole === types_1.UserRole.RESIDENT && payment.userId !== userId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return payment;
    }
    async processPayment(processPaymentDto, userId) {
        const expense = await this.prisma.expense.findUnique({
            where: { id: processPaymentDto.expenseId },
        });
        if (!expense) {
            throw new common_1.NotFoundException('Expense not found');
        }
        const paymentResult = await this.simulatePayment(processPaymentDto);
        const payment = await this.prisma.payment.create({
            data: {
                amount: expense.amount,
                method: processPaymentDto.paymentMethod,
                expenseId: processPaymentDto.expenseId,
                userId,
                date: new Date(),
                receiptUrl: paymentResult.receiptUrl,
            },
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
        });
        await this.updateExpenseStatus(expense.id);
        return payment;
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
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map