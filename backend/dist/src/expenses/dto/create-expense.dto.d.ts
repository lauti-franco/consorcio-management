import { ExpenseType, ExpenseStatus } from '@prisma/client';
export declare class CreateExpenseDto {
    concept: string;
    amount: number;
    dueDate: string;
    period?: string;
    type?: ExpenseType;
    status?: ExpenseStatus;
    propertyId: string;
    unitId?: string;
}
