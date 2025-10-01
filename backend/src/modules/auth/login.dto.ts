// src/auth/dto/login.dto.ts - ACTUALIZADO
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@consorcio.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ 
    example: 'clt2n9z8g000008l49v9o1x2z',
    description: 'Tenant ID (optional for initial login)',
    required: false 
  })
  @IsString()
  @IsOptional()
  tenantId?: string;
}