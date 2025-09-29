// src/documents/dto/create-document.dto.ts
import { IsString, IsOptional, IsBoolean, IsEnum, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// Enum local para DocumentType
export enum DocumentType {
  REGULATION = 'REGULATION',
  MEETING_MINUTES = 'MEETING_MINUTES', 
  CONTRACT = 'CONTRACT',
  FINANCIAL_STATEMENT = 'FINANCIAL_STATEMENT',
  MAINTENANCE_REPORT = 'MAINTENANCE_REPORT',
  INSURANCE = 'INSURANCE',
  BUDGET = 'BUDGET',
  OTHER = 'OTHER'
}

export class CreateDocumentDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: DocumentType })
  @IsEnum(DocumentType)
  type: DocumentType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty()
  @IsString()
  fileName: string;

  @ApiProperty()
  @IsString()
  fileUrl: string;

  @ApiProperty()
  @IsNumber()
  fileSize: number;

  @ApiProperty()
  @IsString()
  mimeType: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  propertyId?: string;
}