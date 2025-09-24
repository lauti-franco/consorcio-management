import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProcessPaymentDto {
  @ApiProperty({ example: 'expense-id' })
  @IsString()
  @IsNotEmpty()
  expenseId: string;

  @ApiProperty({ enum: ['credit_card', 'debit_card', 'transfer', 'cash'], example: 'credit_card' })
  @IsEnum(['credit_card', 'debit_card', 'transfer', 'cash'])
  @IsNotEmpty()
  paymentMethod: string;
}