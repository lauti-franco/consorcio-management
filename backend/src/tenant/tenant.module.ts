// src/tenant/tenant.module.ts
import { Module } from '@nestjs/common';
import { TenantMiddleware } from '../common/middleware/tenant.middleware';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class TenantModule {}