import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
export declare class ExpensesController {
    private readonly expensesService;
    constructor(expensesService: ExpensesService);
    create(createExpenseDto: CreateExpenseDto, req: any): Promise<{
        building: {
            id: string;
            name: string;
            address: string;
            city: string;
            createdAt: Date;
        };
        payments: ({
            user: {
                id: string;
                name: string;
                email: string;
            };
        } & {
            id: string;
            amount: number;
            userId: string;
            date: Date;
            method: string;
            receiptUrl: string | null;
            expenseId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        buildingId: string;
        concept: string;
        amount: number;
        dueDate: Date;
        status: import(".prisma/client").$Enums.ExpenseStatus;
        userId: string | null;
    }>;
    findAll(req: any, buildingId?: string): Promise<({
        building: {
            id: string;
            name: string;
            address: string;
            city: string;
            createdAt: Date;
        };
        payments: ({
            user: {
                id: string;
                name: string;
                email: string;
            };
        } & {
            id: string;
            amount: number;
            userId: string;
            date: Date;
            method: string;
            receiptUrl: string | null;
            expenseId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        buildingId: string;
        concept: string;
        amount: number;
        dueDate: Date;
        status: import(".prisma/client").$Enums.ExpenseStatus;
        userId: string | null;
    })[]>;
    getStats(req: any): Promise<{
        total: number;
        open: number;
        paid: number;
        overdue: number;
        totalAmount: number;
        paidAmount: number;
        pendingAmount: number;
    }>;
    findOne(id: string, req: any): Promise<{
        building: {
            id: string;
            name: string;
            address: string;
            city: string;
            createdAt: Date;
        };
        payments: ({
            user: {
                id: string;
                name: string;
                email: string;
            };
        } & {
            id: string;
            amount: number;
            userId: string;
            date: Date;
            method: string;
            receiptUrl: string | null;
            expenseId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        buildingId: string;
        concept: string;
        amount: number;
        dueDate: Date;
        status: import(".prisma/client").$Enums.ExpenseStatus;
        userId: string | null;
    }>;
    update(id: string, updateExpenseDto: UpdateExpenseDto, req: any): Promise<{
        building: {
            id: string;
            name: string;
            address: string;
            city: string;
            createdAt: Date;
        };
        payments: {
            id: string;
            amount: number;
            userId: string;
            date: Date;
            method: string;
            receiptUrl: string | null;
            expenseId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        buildingId: string;
        concept: string;
        amount: number;
        dueDate: Date;
        status: import(".prisma/client").$Enums.ExpenseStatus;
        userId: string | null;
    }>;
    remove(id: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        buildingId: string;
        concept: string;
        amount: number;
        dueDate: Date;
        status: import(".prisma/client").$Enums.ExpenseStatus;
        userId: string | null;
    }>;
}
