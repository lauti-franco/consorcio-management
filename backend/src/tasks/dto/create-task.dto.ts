
import { IsString, IsNotEmpty, IsOptional, IsArray, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Priority, TaskStatus } from '@prisma/client';

export class CreateTaskDto {
  @ApiProperty({ example: 'Reparar ascensor' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'El ascensor del edificio A necesita mantenimiento preventivo' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'user-id' })
  @IsString()
  @IsNotEmpty()
  assignedTo: string;

  @ApiProperty({ example: 'building-id' })
  @IsString()
  @IsNotEmpty()
  buildingId: string; // AGREGAR buildingId requerido

  @ApiProperty({ enum: Priority, example: Priority.MEDIUM })
  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

  @ApiProperty({ enum: TaskStatus, example: TaskStatus.PENDING, required: false })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiProperty({ example: '2024-01-20', required: false })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiProperty({ example: [], required: false })
  @IsArray()
  @IsOptional()
  photos?: string[];
}
