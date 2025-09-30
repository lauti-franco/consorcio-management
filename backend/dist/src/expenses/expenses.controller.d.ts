import { Request } from 'express';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
export declare class ExpensesController {
    private readonly expensesService;
    constructor(expensesService: ExpensesService);
    create(createExpenseDto: CreateExpenseDto, req: Request): Promise<{
        payments: ({
            user: {
                id: string;
                name: string;
                email: string;
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
        })[];
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
    }>;
    findAll(req: Request, propertyId?: string): Promise<({
        payments: ({
            user: {
                id: string;
                name: string;
                email: string;
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
        })[];
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
    })[]>;
    getStats(req: Request, propertyId?: string): Promise<{
        total: number;
        open: number;
        paid: number;
        overdue: number;
        totalAmount: number;
        paidAmount: number;
        pendingAmount: number;
    }>;
    findOne(id: string, req: Request): Promise<{
        payments: ({
            user: {
                id: string;
                name: string;
                email: string;
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
        })[];
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
    }>;
    update(id: string, updateExpenseDto: UpdateExpenseDto, req: Request): Promise<{
        payments: ({
            user: {
                id: string;
                name: string;
                email: string;
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
        })[];
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
    }>;
    remove(id: string, req: Request): Promise<{
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
    }>;
}
