// src/auth/dto/register.dto.ts - ACTUALIZADO
import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client'; // Cambiar a Prisma enum

export class RegisterDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: UserRole, example: UserRole.RESIDENT })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ 
    description: 'Tenant ID (optional - required for non-admin users)',
    example: 'clt2n9z8g000008l49v9o1x2z',
    required: false 
  })
  @IsOptional()
  @IsString()
  tenantId?: string;

  // REMOVED: buildingId ya no existe en el schema multi-tenant
}