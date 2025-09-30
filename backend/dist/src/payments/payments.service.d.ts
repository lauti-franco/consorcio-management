import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { UserRole } from '@prisma/client';
export declare class PaymentsService {
    private prisma;
    private configService;
    constructor(prisma: PrismaService, configService: ConfigService);
    create(createPaymentDto: CreatePaymentDto & {
        tenantId: string;
    }, userId: string): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
        };
        unit: {
            number: string;
            id: string;
            property: {
                id: string;
                name: string;
            };
            floor: number;
        };
        expense: {
            property: {
                id: string;
                name: string;
                address: string;
            };
            unit: {
                number: string;
                id: string;
                floor: number;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string | null;
            tenantId: string;
            status: import(".prisma/client").$Enums.ExpenseStatus;
            type: import(".prisma/client").$Enums.ExpenseType;
            propertyId: string;
            concept: string;
            amount: number;
            dueDate: Date;
            period: string | null;
            unitId: string | null;
        };
    } & {
        id: string;
        userId: string;
        tenantId: string;
        status: import(".prisma/client").$Enums.PaymentStatus;
        amount: number;
        unitId: string;
        date: Date;
        method: import(".prisma/client").$Enums.PaymentMethod;
        transactionId: string | null;
        receiptUrl: string | null;
        expenseId: string;
    }>;
    createMercadoPagoPreference(expenseId: string, userId: string, tenantId: string): Promise<{
        preferenceId: string;
        init_point: string;
        sandbox_init_point: string;
        expense: {
            id: string;
            concept: string;
            amount: number;
            period: string;
        };
        message: string;
    }>;
    processMercadoPagoWebhook(webhookData: any): Promise<{
        success: boolean;
        message: string;
        data: {
            paymentId: any;
            status: string;
            amount: number;
        };
        type?: undefined;
    } | {
        success: boolean;
        message: string;
        type: any;
        data?: undefined;
    } | {
        success: boolean;
        message: string;
        data?: undefined;
        type?: undefined;
    }>;
    processPayment(processPaymentDto: ProcessPaymentDto & {
        tenantId: string;
    }, userId: string): Promise<{
        preferenceId: string;
        init_point: string;
        sandbox_init_point: string;
        expense: {
            id: string;
            concept: string;
            amount: number;
            period: string;
        };
        message: string;
    } | ({
        user: {
            id: string;
            name: string;
            email: string;
        };
        unit: {
            number: string;
            id: string;
            property: {
                id: string;
                name: string;
            };
            floor: number;
        };
        expense: {
            property: {
                id: string;
                name: string;
                address: string;
            };
            unit: {
                number: string;
                id: string;
                floor: number;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string | null;
            tenantId: string;
            status: import(".prisma/client").$Enums.ExpenseStatus;
            type: import(".prisma/client").$Enums.ExpenseType;
            propertyId: string;
            concept: string;
            amount: number;
            dueDate: Date;
            period: string | null;
            unitId: string | null;
        };
    } & {
        id: string;
        userId: string;
        tenantId: string;
        status: import(".prisma/client").$Enums.PaymentStatus;
        amount: number;
        unitId: string;
        date: Date;
        method: import(".prisma/client").$Enums.PaymentMethod;
        transactionId: string | null;
        receiptUrl: string | null;
        expenseId: string;
    })>;
    findAll(userId: string, userRole: UserRole, tenantId: string, propertyId?: string): Promise<({
        user: {
            id: string;
            name: string;
            email: string;
        };
        unit: {
            number: string;
            id: string;
            property: {
                id: string;
                name: string;
            };
            floor: number;
        };
        expense: {
            property: {
                id: string;
                name: string;
                address: string;
            };
            unit: {
                number: string;
                id: string;
                floor: number;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string | null;
            tenantId: string;
            status: import(".prisma/client").$Enums.ExpenseStatus;
            type: import(".prisma/client").$Enums.ExpenseType;
            propertyId: string;
            concept: string;
            amount: number;
            dueDate: Date;
            period: string | null;
            unitId: string | null;
        };
    } & {
        id: string;
        userId: string;
        tenantId: string;
        status: import(".prisma/client").$Enums.PaymentStatus;
        amount: number;
        unitId: string;
        date: Date;
        method: import(".prisma/client").$Enums.PaymentMethod;
        transactionId: string | null;
        receiptUrl: string | null;
        expenseId: string;
    })[]>;
    findOne(id: string, userId: string, userRole: UserRole, tenantId: string): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
        };
        unit: {
            number: string;
            id: string;
            property: {
                id: string;
                name: string;
            };
            floor: number;
        };
        expense: {
            property: {
                id: string;
                name: string;
                address: string;
            };
            unit: {
                number: string;
                id: string;
                floor: number;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string | null;
            tenantId: string;
            status: import(".prisma/client").$Enums.ExpenseStatus;
            type: import(".prisma/client").$Enums.ExpenseType;
            propertyId: string;
            concept: string;
            amount: number;
            dueDate: Date;
            period: string | null;
            unitId: string | null;
        };
    } & {
        id: string;
        userId: string;
        tenantId: string;
        status: import(".prisma/client").$Enums.PaymentStatus;
        amount: number;
        unitId: string;
        date: Date;
        method: import(".prisma/client").$Enums.PaymentMethod;
        transactionId: string | null;
        receiptUrl: string | null;
        expenseId: string;
    }>;
    getPaymentStats(userId: string, userRole: UserRole, tenantId: string, propertyId?: string): Promise<{
        totalPayments: number;
        totalAmount: number;
        monthlyRevenue: number;
        completedPayments: number;
        successRate: number;
    }>;
    private simulatePayment;
    private updateExpenseStatus;
    private verifyPaymentAccess;
    private mapMercadoPagoStatus;
    private sendPaymentNotification;
}
