// src/documents/dto/share-document.dto.ts
import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { UserRole } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class ShareDocumentDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ required: false, enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiProperty({ default: true })
  @IsBoolean()
  canView: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  canEdit: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  canDelete: boolean;
}