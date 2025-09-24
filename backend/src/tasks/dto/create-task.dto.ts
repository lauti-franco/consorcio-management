import { IsString, IsNotEmpty, IsOptional, IsArray, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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

  @ApiProperty({ example: '2024-01-20', required: false })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiProperty({ example: [], required: false })
  @IsArray()
  @IsOptional()
  photos?: string[];
}