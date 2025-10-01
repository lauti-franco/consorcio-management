import { IsString, IsNotEmpty, IsOptional, IsArray, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Priority, TicketStatus } from '@prisma/client';

export class CreateTicketDto {
  @ApiProperty({ example: 'Fuga de agua en baño' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Hay una fuga de agua constante en el baño principal' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ enum: Priority, example: Priority.MEDIUM })
  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

  @ApiProperty({ enum: TicketStatus, example: TicketStatus.OPEN, required: false })
  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus;

  @ApiProperty({ example: 'PLUMBING' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: 'property-id' })
  @IsString()
  @IsNotEmpty()
  propertyId: string; // CAMBIADO: buildingId → propertyId

  @ApiProperty({ example: 'unit-id', required: false })
  @IsString()
  @IsOptional()
  unitId?: string;

  @ApiProperty({ example: 'user-id', required: false })
  @IsString()
  @IsOptional()
  assignedTo?: string;

  @ApiProperty({ example: [], required: false })
  @IsArray()
  @IsOptional()
  photos?: string[];
}