import { IsString, IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({ example: 15000.50 })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ example: 'transfer' })
  @IsString()
  @IsNotEmpty()
  method: string;

  @ApiProperty({ example: 'expense-id' })
  @IsString()
  @IsNotEmpty()
  expenseId: string;
}