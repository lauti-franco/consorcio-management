import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { UserRole } from '../common/types';
export declare class ExpensesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createExpenseDto: CreateExpenseDto, userId: string): Promise<{
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
    findAll(userId: string, userRole: UserRole, buildingId?: string): Promise<({
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
    findOne(id: string, userId: string, userRole: UserRole, buildingId?: string): Promise<{
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
    update(id: string, updateExpenseDto: UpdateExpenseDto, userId: string): Promise<{
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
    remove(id: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        buildingId: string;
        concept: string;
        amount: number;
        dueDate: Date;
        status: import(".prisma/client").$Enums.ExpenseStatus;
        userId: string | null;
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
