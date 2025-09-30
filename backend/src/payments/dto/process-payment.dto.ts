import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';

export class ProcessPaymentDto {
  @ApiProperty({ example: 'expense-id' })
  @IsString()
  @IsNotEmpty()
  expenseId: string;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.CARD })
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  paymentMethod: PaymentMethod;

  @ApiProperty({ enum: ['MERCADOPAGO', 'MANUAL'], example: 'MERCADOPAGO', required: false })
  @IsEnum(['MERCADOPAGO', 'MANUAL'])
  @IsOptional()
  processor?: string;
}