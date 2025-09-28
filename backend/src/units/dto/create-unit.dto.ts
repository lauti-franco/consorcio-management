import { IsString, IsNumber, IsOptional, IsEnum, IsArray } from 'class-validator';
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
  @IsArray()
  @IsOptional()
  features?: string[];

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  managerId?: string;

  @ApiProperty()
  @IsString()
  buildingId: string;
}