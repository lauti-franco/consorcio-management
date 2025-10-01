import { IsString, IsNumber, IsOptional, IsEnum, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UnitType } from '@prisma/client';

export class CreateUnitDto {
  @ApiProperty()
  @IsString()
  number: string;

  @ApiProperty()
  @IsNumber()
  floor: number;

  @ApiProperty({ enum: UnitType })
  @IsEnum(UnitType)
  type: UnitType;

  @ApiProperty()
  @IsNumber()
  area: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  bedrooms?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  bathrooms?: number;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isOccupied?: boolean; // AGREGADO: campo que existe en el schema

  @ApiProperty({ required: false })
  @IsArray()
  @IsOptional()
  features?: string[];

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  managerId?: string;

  @ApiProperty()
  @IsString()
  propertyId: string; // CAMBIADO: buildingId → propertyId
}