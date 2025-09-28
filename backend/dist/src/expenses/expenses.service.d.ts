import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { UserRole } from '../common/types';
export declare class ExpensesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createExpenseDto: CreateExpenseDto, userId: string): Promise<{
        payments: ({
            user: {
                id: string;
                name: string;
                email: string;
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
        })[];
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
    }>;
    findAll(userId: string, userRole: UserRole, buildingId?: string): Promise<({
        payments: ({
            user: {
                id: string;
                name: string;
                email: string;
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
        })[];
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
    })[]>;
    findOne(id: string, userId: string, userRole: UserRole, buildingId?: string): Promise<{
        payments: ({
            user: {
                id: string;
                name: string;
                email: string;
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
        })[];
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
    }>;
    update(id: string, updateExpenseDto: UpdateExpenseDto, userId: string): Promise<{
        payments: {
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
        }[];
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
    }>;
    remove(id: string, userId: string): Promise<{
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
    }>;
    getStats(buildingId?: string): Promise<{
        total: number;
        open: number;
        paid: number;
        overdue: number;
        totalAmount: number;
        paidAmount: number;
        pendingAmount: number;
    }>;
}
