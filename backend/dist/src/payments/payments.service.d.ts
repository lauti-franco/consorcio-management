import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { UserRole } from '../common/types';
export declare class PaymentsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createPaymentDto: CreatePaymentDto, userId: string): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
        };
        expense: {
            id: string;
            createdAt: Date;
            buildingId: string;
            concept: string;
            amount: number;
            dueDate: Date;
            status: import(".prisma/client").$Enums.ExpenseStatus;
            userId: string | null;
        };
    } & {
        id: string;
        amount: number;
        userId: string;
        date: Date;
        method: string;
        receiptUrl: string | null;
        expenseId: string;
    }>;
    findAll(userId: string, userRole: UserRole, buildingId?: string): Promise<({
        user: {
            id: string;
            name: string;
            email: string;
        };
        expense: {
            building: {
                id: string;
                name: string;
                address: string;
                city: string;
                createdAt: Date;
            };
        } & {
            id: string;
            createdAt: Date;
            buildingId: string;
            concept: string;
            amount: number;
            dueDate: Date;
            status: import(".prisma/client").$Enums.ExpenseStatus;
            userId: string | null;
        };
    } & {
        id: string;
        amount: number;
        userId: string;
        date: Date;
        method: string;
        receiptUrl: string | null;
        expenseId: string;
    })[]>;
    findOne(id: string, userId: string, userRole: UserRole): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
        };
        expense: {
            building: {
                id: string;
                name: string;
                address: string;
                city: string;
                createdAt: Date;
            };
        } & {
            id: string;
            createdAt: Date;
            buildingId: string;
            concept: string;
            amount: number;
            dueDate: Date;
            status: import(".prisma/client").$Enums.ExpenseStatus;
            userId: string | null;
        };
    } & {
        id: string;
        amount: number;
        userId: string;
        date: Date;
        method: string;
        receiptUrl: string | null;
        expenseId: string;
    }>;
    processPayment(processPaymentDto: ProcessPaymentDto, userId: string): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
        };
        expense: {
            id: string;
            createdAt: Date;
            buildingId: string;
            concept: string;
            amount: number;
            dueDate: Date;
            status: import(".prisma/client").$Enums.ExpenseStatus;
            userId: string | null;
        };
    } & {
        id: string;
        amount: number;
        userId: string;
        date: Date;
        method: string;
        receiptUrl: string | null;
        expenseId: string;
    }>;
    private simulatePayment;
    private updateExpenseStatus;
}
