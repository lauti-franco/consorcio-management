import { IsString, IsNumber, IsDateString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ExpenseType, ExpenseStatus } from '@prisma/client';

export class CreateExpenseDto {
  @ApiProperty({ example: 'Expensas Ordinarias Enero' })
  @IsString()
  @IsNotEmpty()
  concept: string;

  @ApiProperty({ example: 15000.50 })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ example: '2024-01-10' })
  @IsDateString()
  @IsNotEmpty()
  dueDate: string;

  @ApiProperty({ example: '2024-01' })
  @IsString()
  @IsOptional()
  period?: string;

  @ApiProperty({ enum: ExpenseType, example: ExpenseType.ORDINARY })
  @IsEnum(ExpenseType)
  @IsOptional()
  type?: ExpenseType;

  @ApiProperty({ enum: ExpenseStatus, example: ExpenseStatus.OPEN })
  @IsEnum(ExpenseStatus)
  @IsOptional()
  status?: ExpenseStatus;

  @ApiProperty({ example: 'clave-de-la-propiedad' })
  @IsString()
  @IsNotEmpty()
  propertyId: string; // CAMBIADO: buildingId → propertyId

  @ApiProperty({ example: 'clave-de-la-unidad', required: false })
  @IsString()
  @IsOptional()
  unitId?: string;
}