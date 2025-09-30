// src/buildings/dto/create-building.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBuildingDto {
  @ApiProperty({ example: 'Edificio Central' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Av. Principal 123' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 'Buenos Aires' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ 
    example: {
      currency: 'ARS',
      language: 'es',
      expenseCalculation: 'area_based',
      paymentMethods: ['transfer', 'cash'],
      dueDay: 10
    },
    required: false 
  })
  @IsObject()
  @IsOptional()
  settings?: Record<string, any>;
}