import { PaymentMethod } from '@prisma/client';
export declare class ProcessPaymentDto {
    expenseId: string;
    paymentMethod: PaymentMethod;
    processor?: string;
}
