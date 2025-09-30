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
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let PaymentsService = class PaymentsService {
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
    }
    async create(createPaymentDto, userId) {
        const expense = await this.prisma.expense.findFirst({
            where: {
                id: createPaymentDto.expenseId,
                tenantId: createPaymentDto.tenantId
            },
            include: {
                unit: true,
                property: true
            },
        });
        if (!expense) {
            throw new common_1.NotFoundException('Expense not found in this tenant');
        }
        if (!expense.unitId) {
            throw new common_1.NotFoundException('Expense must be associated with a unit');
        }
        const unitAccess = await this.prisma.unit.findFirst({
            where: {
                id: expense.unitId,
                managerId: userId,
                tenantId: createPaymentDto.tenantId
            },
        });
        if (!unitAccess) {
            throw new common_1.ForbiddenException('No tienes permisos para crear pagos en esta unidad');
        }
        return this.prisma.payment.create({
            data: {
                amount: createPaymentDto.amount,
                method: createPaymentDto.method,
                status: client_1.PaymentStatus.COMPLETED,
                expenseId: createPaymentDto.expenseId,
                userId: userId,
                unitId: expense.unitId,
                tenantId: createPaymentDto.tenantId,
                date: new Date(),
            },
            include: {
                expense: {
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
                        floor: true,
                        property: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    },
                },
            },
        });
    }
    async createMercadoPagoPreference(expenseId, userId, tenantId) {
        console.log('📱 Creando preferencia MOCK de MercadoPago...');
        const expense = await this.prisma.expense.findFirst({
            where: {
                id: expenseId,
                tenantId: tenantId
            },
            include: {
                unit: {
                    include: {
                        property: true,
                        manager: {
                            select: {
                                name: true,
                                email: true
                            }
                        }
                    }
                },
                property: true
            },
        });
        if (!expense) {
            throw new common_1.NotFoundException('Expense not found in this tenant');
        }
        const unitAccess = await this.prisma.unit.findFirst({
            where: {
                id: expense.unitId,
                managerId: userId,
                tenantId: tenantId
            },
        });
        if (!unitAccess) {
            throw new common_1.ForbiddenException('No tienes permisos para pagar esta expensa');
        }
        const mockPreferenceId = `mock_pref_${Date.now()}`;
        console.log(`✅ Preferencia MOCK creada: ${mockPreferenceId} para expensa: ${expenseId}`);
        await this.prisma.payment.create({
            data: {
                amount: expense.amount,
                method: client_1.PaymentMethod.CARD,
                status: client_1.PaymentStatus.PENDING,
                expenseId: expenseId,
                userId: userId,
                unitId: expense.unitId,
                tenantId: tenantId,
                date: new Date(),
                transactionId: mockPreferenceId,
            },
        });
        return {
            preferenceId: mockPreferenceId,
            init_point: `https://mercadopago-mock.com/checkout/${mockPreferenceId}`,
            sandbox_init_point: `https://sandbox.mercadopago-mock.com/checkout/${mockPreferenceId}`,
            expense: {
                id: expense.id,
                concept: expense.concept,
                amount: expense.amount,
                period: expense.period
            },
            message: "✅ PREFERENCIA MOCK - Para probar el flujo completo"
        };
    }
    async processMercadoPagoWebhook(webhookData) {
        console.log('🔔 Webhook MOCK recibido:', webhookData);
        try {
            const { type, data } = webhookData;
            if (type === 'payment') {
                const paymentId = data.id;
                console.log(`🔄 Procesando pago MOCK: ${paymentId}`);
                await new Promise(resolve => setTimeout(resolve, 500));
                console.log('✅ Webhook MOCK procesado exitosamente');
                return {
                    success: true,
                    message: 'Webhook MOCK processed successfully',
                    data: {
                        paymentId: paymentId,
                        status: 'approved',
                        amount: 15000.50
                    }
                };
            }
            return {
                success: true,
                message: 'Webhook MOCK ignored - tipo no manejado',
                type: type
            };
        }
        catch (error) {
            console.error('❌ Error procesando webhook MOCK:', error);
            return {
                success: false,
                message: 'Error processing MOCK webhook: ' + error.message
            };
        }
    }
    async processPayment(processPaymentDto, userId) {
        if (processPaymentDto.paymentMethod === client_1.PaymentMethod.CARD &&
            processPaymentDto.processor === 'MERCADOPAGO') {
            return this.createMercadoPagoPreference(processPaymentDto.expenseId, userId, processPaymentDto.tenantId);
        }
        const expense = await this.prisma.expense.findFirst({
            where: {
                id: processPaymentDto.expenseId,
                tenantId: processPaymentDto.tenantId
            },
            include: {
                unit: true,
                property: true
            },
        });
        if (!expense) {
            throw new common_1.NotFoundException('Expense not found in this tenant');
        }
        if (!expense.unitId) {
            throw new common_1.NotFoundException('Expense must be associated with a unit');
        }
        const unitAccess = await this.prisma.unit.findFirst({
            where: {
                id: expense.unitId,
                managerId: userId,
                tenantId: processPaymentDto.tenantId
            },
        });
        if (!unitAccess) {
            throw new common_1.ForbiddenException('No tienes permisos para pagar esta expensa en este tenant');
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
                tenantId: processPaymentDto.tenantId,
                date: new Date(),
                transactionId: paymentResult.transactionId,
                receiptUrl: paymentResult.receiptUrl,
            },
            include: {
                expense: {
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
                        floor: true,
                        property: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    },
                },
            },
        });
        await this.updateExpenseStatus(expense.id, processPaymentDto.tenantId);
        return payment;
    }
    async findAll(userId, userRole, tenantId, propertyId) {
        const where = { tenantId };
        if (userRole === client_1.UserRole.RESIDENT) {
            where.unit = {
                managerId: userId,
                tenantId: tenantId
            };
        }
        else if (userRole === client_1.UserRole.ADMIN || userRole === client_1.UserRole.SUPER_ADMIN) {
            if (propertyId) {
                where.expense = {
                    propertyId: propertyId,
                    tenantId: tenantId
                };
            }
            else {
                where.expense = {
                    property: {
                        ownerId: userId,
                        tenantId: tenantId
                    }
                };
            }
        }
        else if (userRole === client_1.UserRole.MAINTENANCE) {
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
            where.expense = {
                propertyId: {
                    in: maintenanceProperties.map(prop => prop.id)
                },
                tenantId: tenantId
            };
        }
        return this.prisma.payment.findMany({
            where,
            include: {
                expense: {
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
                        floor: true,
                        property: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    },
                },
            },
            orderBy: {
                date: 'desc',
            },
        });
    }
    async findOne(id, userId, userRole, tenantId) {
        const payment = await this.prisma.payment.findFirst({
            where: {
                id,
                tenantId
            },
            include: {
                expense: {
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
                        floor: true,
                        property: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    },
                },
            },
        });
        if (!payment) {
            throw new common_1.NotFoundException('Payment not found in this tenant');
        }
        await this.verifyPaymentAccess(payment, userId, userRole, tenantId);
        return payment;
    }
    async getPaymentStats(userId, userRole, tenantId, propertyId) {
        const where = { tenantId };
        if (userRole === client_1.UserRole.RESIDENT) {
            where.unit = {
                managerId: userId,
                tenantId: tenantId
            };
        }
        else if (userRole === client_1.UserRole.ADMIN || userRole === client_1.UserRole.SUPER_ADMIN) {
            if (propertyId) {
                where.expense = {
                    propertyId: propertyId,
                    tenantId: tenantId
                };
            }
            else {
                where.expense = {
                    property: {
                        ownerId: userId,
                        tenantId: tenantId
                    }
                };
            }
        }
        else if (userRole === client_1.UserRole.MAINTENANCE) {
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
            where.expense = {
                propertyId: {
                    in: maintenanceProperties.map(prop => prop.id)
                },
                tenantId: tenantId
            };
        }
        const [totalPayments, totalAmount, monthlyRevenue, completedPayments] = await Promise.all([
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
            this.prisma.payment.count({
                where: {
                    ...where,
                    status: client_1.PaymentStatus.COMPLETED
                }
            })
        ]);
        return {
            totalPayments,
            totalAmount: totalAmount._sum.amount || 0,
            monthlyRevenue: monthlyRevenue._sum.amount || 0,
            completedPayments,
            successRate: totalPayments > 0 ? (completedPayments / totalPayments) * 100 : 0
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
    async updateExpenseStatus(expenseId, tenantId) {
        const expense = await this.prisma.expense.findFirst({
            where: {
                id: expenseId,
                tenantId: tenantId
            },
            include: {
                payments: {
                    where: {
                        tenantId: tenantId,
                        status: client_1.PaymentStatus.COMPLETED
                    }
                }
            },
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
    async verifyPaymentAccess(payment, userId, userRole, tenantId) {
        if (userRole === client_1.UserRole.ADMIN || userRole === client_1.UserRole.SUPER_ADMIN) {
            const property = await this.prisma.property.findFirst({
                where: {
                    id: payment.expense.propertyId,
                    ownerId: userId,
                    tenantId: tenantId
                },
            });
            if (!property) {
                throw new common_1.ForbiddenException('Access denied to this payment');
            }
            return true;
        }
        if (userRole === client_1.UserRole.RESIDENT) {
            if (payment.unit.managerId !== userId) {
                throw new common_1.ForbiddenException('Access denied to this payment');
            }
            return true;
        }
        if (userRole === client_1.UserRole.MAINTENANCE) {
            const maintenanceAccess = await this.prisma.ticket.findFirst({
                where: {
                    propertyId: payment.expense.propertyId,
                    assignedToId: userId,
                    tenantId: tenantId
                }
            });
            if (!maintenanceAccess) {
                throw new common_1.ForbiddenException('Access denied to this payment');
            }
            return true;
        }
        throw new common_1.ForbiddenException('Access denied to this payment');
    }
    mapMercadoPagoStatus(mercadoPagoStatus) {
        switch (mercadoPagoStatus) {
            case 'approved':
                return client_1.PaymentStatus.COMPLETED;
            case 'pending':
                return client_1.PaymentStatus.PENDING;
            case 'in_process':
                return client_1.PaymentStatus.PENDING;
            case 'rejected':
                return client_1.PaymentStatus.FAILED;
            case 'cancelled':
                return client_1.PaymentStatus.FAILED;
            case 'refunded':
                return client_1.PaymentStatus.REFUNDED;
            default:
                return client_1.PaymentStatus.PENDING;
        }
    }
    async sendPaymentNotification(expenseId, userId, tenantId, status) {
        console.log(`📧 Notificación MOCK: Expensa ${expenseId}, Usuario ${userId}, Estado ${status}`);
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map