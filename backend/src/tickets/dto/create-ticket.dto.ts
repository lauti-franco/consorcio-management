import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTicketDto {
  @ApiProperty({ example: 'Fuga de agua en baño' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Hay una fuga de agua constante en el baño principal' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: [], required: false })
  @IsArray()
  @IsOptional()
  photos?: string[];
}