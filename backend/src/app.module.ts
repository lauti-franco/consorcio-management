// src/app.module.ts - VERSIÓN ACTUALIZADA CON DOCUMENTS Y KPIs
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import configuration from './config/configuration';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BuildingsModule } from './buildings/buildings.module';
import { ExpensesModule } from './expenses/expenses.module';
import { PaymentsModule } from './payments/payments.module';
import { TicketsModule } from './tickets/tickets.module';
import { TasksModule } from './tasks/tasks.module';
import { FilesModule } from './files/files.module';
import { PrismaModule } from './prisma/prisma.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { UnitsModule } from './units/units.module';
import { DashboardModule } from './dashboard/dashboard.module';

// NUEVOS MÓDULOS PARA FASE 2
import { DocumentsModule } from './documents/documents.module';
import { KpisModule } from './kpis/kpis.module';

// Importar el middleware de tenant
import { TenantMiddleware } from './common/middleware/tenant.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          const ext = extname(file.originalname);
          callback(null, `${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    BuildingsModule,
    ExpensesModule,
    PaymentsModule,
    TicketsModule,
    TasksModule,
    FilesModule,
    SubscriptionsModule,
    UnitsModule,
    DashboardModule,
    
    // NUEVOS MÓDULOS AGREGADOS
    DocumentsModule,
    KpisModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .exclude(
        // Rutas de autenticación (públicas)
        'auth/(.*)',
        
        // Health checks (si los tienes)
        'health',
        
        // Documentación de API (Swagger)
        'api',
        'api/(.*)',
        'docs',
        'docs/(.*)',
        
        // Archivos estáticos y uploads
        'uploads/(.*)',
        'files/public/(.*)',
        
        // Webhooks externos (pagos, etc.)
        'webhooks/(.*)',
        'payments/webhook/(.*)',
        
        // Rutas públicas de información
        'public/(.*)'
      )
      .forRoutes('*');
  }
}