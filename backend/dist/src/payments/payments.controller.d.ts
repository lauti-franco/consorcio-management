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
    processPayment(processPaymentDto: ProcessPaymentDto, req: any): Promise<{
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
    findAll(req: any): Promise<({
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
    findOne(id: string, req: any): Promise<{
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
}
