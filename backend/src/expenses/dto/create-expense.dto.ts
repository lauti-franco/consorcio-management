import { IsString, IsNumber, IsDateString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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

  @ApiProperty({ example: 'clave-del-edificio' })
  @IsString()
  @IsNotEmpty()
  buildingId: string;
}