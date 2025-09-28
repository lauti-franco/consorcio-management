import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ProcessPaymentDto } from './dto/process-payment.dto';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    create(createPaymentDto: CreatePaymentDto, req: any): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
        };
        unit: {
            number: string;
            id: string;
            building: {
                id: string;
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                address: string;
                city: string;
                settings: import("@prisma/client/runtime/library").JsonValue;
                ownerId: string;
            };
        };
        expense: {
            building: {
                id: string;
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                address: string;
                city: string;
                settings: import("@prisma/client/runtime/library").JsonValue;
                ownerId: string;
            };
            unit: {
                number: string;
                id: string;
                features: string[];
                floor: number;
                type: import(".prisma/client").$Enums.UnitType;
                area: number;
                bedrooms: number | null;
                bathrooms: number | null;
                isOccupied: boolean;
                buildingId: string;
                managerId: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.ExpenseStatus;
            userId: string | null;
            type: import(".prisma/client").$Enums.ExpenseType;
            buildingId: string;
            concept: string;
            amount: number;
            dueDate: Date;
            period: string | null;
            unitId: string | null;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.PaymentStatus;
        userId: string;
        amount: number;
        unitId: string;
        date: Date;
        method: import(".prisma/client").$Enums.PaymentMethod;
        transactionId: string | null;
        receiptUrl: string | null;
        expenseId: string;
    }>;
    processPayment(processPaymentDto: ProcessPaymentDto, req: any): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
        };
        unit: {
            number: string;
            id: string;
            building: {
                id: string;
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                address: string;
                city: string;
                settings: import("@prisma/client/runtime/library").JsonValue;
                ownerId: string;
            };
        };
        expense: {
            building: {
                id: string;
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                address: string;
                city: string;
                settings: import("@prisma/client/runtime/library").JsonValue;
                ownerId: string;
            };
            unit: {
                number: string;
                id: string;
                features: string[];
                floor: number;
                type: import(".prisma/client").$Enums.UnitType;
                area: number;
                bedrooms: number | null;
                bathrooms: number | null;
                isOccupied: boolean;
                buildingId: string;
                managerId: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.ExpenseStatus;
            userId: string | null;
            type: import(".prisma/client").$Enums.ExpenseType;
            buildingId: string;
            concept: string;
            amount: number;
            dueDate: Date;
            period: string | null;
            unitId: string | null;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.PaymentStatus;
        userId: string;
        amount: number;
        unitId: string;
        date: Date;
        method: import(".prisma/client").$Enums.PaymentMethod;
        transactionId: string | null;
        receiptUrl: string | null;
        expenseId: string;
    }>;
    findAll(req: any): Promise<({
        user: {
            id: string;
            name: string;
            email: string;
        };
        unit: {
            number: string;
            id: string;
            building: {
                id: string;
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                address: string;
                city: string;
                settings: import("@prisma/client/runtime/library").JsonValue;
                ownerId: string;
            };
        };
        expense: {
            building: {
                id: string;
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                address: string;
                city: string;
                settings: import("@prisma/client/runtime/library").JsonValue;
                ownerId: string;
            };
            unit: {
                number: string;
                id: string;
                features: string[];
                floor: number;
                type: import(".prisma/client").$Enums.UnitType;
                area: number;
                bedrooms: number | null;
                bathrooms: number | null;
                isOccupied: boolean;
                buildingId: string;
                managerId: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.ExpenseStatus;
            userId: string | null;
            type: import(".prisma/client").$Enums.ExpenseType;
            buildingId: string;
            concept: string;
            amount: number;
            dueDate: Date;
            period: string | null;
            unitId: string | null;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.PaymentStatus;
        userId: string;
        amount: number;
        unitId: string;
        date: Date;
        method: import(".prisma/client").$Enums.PaymentMethod;
        transactionId: string | null;
        receiptUrl: string | null;
        expenseId: string;
    })[]>;
    findOne(id: string, req: any): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
        };
        unit: {
            number: string;
            id: string;
            building: {
                id: string;
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                address: string;
                city: string;
                settings: import("@prisma/client/runtime/library").JsonValue;
                ownerId: string;
            };
        };
        expense: {
            building: {
                id: string;
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                address: string;
                city: string;
                settings: import("@prisma/client/runtime/library").JsonValue;
                ownerId: string;
            };
            unit: {
                number: string;
                id: string;
                features: string[];
                floor: number;
                type: import(".prisma/client").$Enums.UnitType;
                area: number;
                bedrooms: number | null;
                bathrooms: number | null;
                isOccupied: boolean;
                buildingId: string;
                managerId: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.ExpenseStatus;
            userId: string | null;
            type: import(".prisma/client").$Enums.ExpenseType;
            buildingId: string;
            concept: string;
            amount: number;
            dueDate: Date;
            period: string | null;
            unitId: string | null;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.PaymentStatus;
        userId: string;
        amount: number;
        unitId: string;
        date: Date;
        method: import(".prisma/client").$Enums.PaymentMethod;
        transactionId: string | null;
        receiptUrl: string | null;
        expenseId: string;
    }>;
}
