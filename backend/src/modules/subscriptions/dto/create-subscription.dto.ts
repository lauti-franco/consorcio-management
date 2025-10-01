// src/subscriptions/dto/create-subscription.dto.ts
import { IsEnum, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PlanType, SubscriptionStatus } from '@prisma/client';

export class CreateSubscriptionDto {
  @ApiProperty({ enum: PlanType })
  @IsEnum(PlanType)
  plan: PlanType;

  @ApiProperty({ enum: SubscriptionStatus, required: false })
  @IsEnum(SubscriptionStatus)
  @IsOptional()
  status?: SubscriptionStatus;

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  features?: object;
}