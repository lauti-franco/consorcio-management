import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config'; // ← Agregar ConfigService
import { PrismaModule } from '../shared/database/prisma.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { TenantGuard } from './guards/tenant.guard';
import { LoggingInterceptor } from './interceptors/logging.interceptor';

@Global()
@Module({
  imports: [ConfigModule.forRoot(), PrismaModule],
  providers: [
    ConfigService, // ← Agregar esto
    JwtAuthGuard,
    RolesGuard,
    TenantGuard,
    LoggingInterceptor,
  ],
  exports: [
    ConfigService, // ← Agregar esto
    PrismaModule,
  ],
})
export class CoreModule {}