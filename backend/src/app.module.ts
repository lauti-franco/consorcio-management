import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { AuthModule } from './modules/auth/auth.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { UsersModule } from './modules/users/users.module';
import { BuildingsModule } from './modules/buildings/buildings.module';
import { UnitsModule } from './modules/units/units.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { KpisModule } from './modules/kpis/kpis.module';

@Module({
  imports: [
    CoreModule,
    AuthModule,
    TenantModule,
    UsersModule,
    BuildingsModule,
    UnitsModule,
    PaymentsModule,
    ExpensesModule,
    DashboardModule,
    DocumentsModule,
    TasksModule,
    TicketsModule,
    SubscriptionsModule,
    KpisModule,
  ],
})
export class AppModule {}
