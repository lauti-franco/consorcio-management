import { PaymentMethod } from '@prisma/client';
export declare class CreatePaymentDto {
    amount: number;
    method: PaymentMethod;
    expenseId: string;
}
