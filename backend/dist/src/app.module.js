"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_module_1 = require("./core/core.module");
const auth_module_1 = require("./modules/auth/auth.module");
const tenant_module_1 = require("./modules/tenant/tenant.module");
const users_module_1 = require("./modules/users/users.module");
const buildings_module_1 = require("./modules/buildings/buildings.module");
const units_module_1 = require("./modules/units/units.module");
const payments_module_1 = require("./modules/payments/payments.module");
const expenses_module_1 = require("./modules/expenses/expenses.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const documents_module_1 = require("./modules/documents/documents.module");
const tasks_module_1 = require("./modules/tasks/tasks.module");
const tickets_module_1 = require("./modules/tickets/tickets.module");
const subscriptions_module_1 = require("./modules/subscriptions/subscriptions.module");
const kpis_module_1 = require("./modules/kpis/kpis.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            core_module_1.CoreModule,
            auth_module_1.AuthModule,
            tenant_module_1.TenantModule,
            users_module_1.UsersModule,
            buildings_module_1.BuildingsModule,
            units_module_1.UnitsModule,
            payments_module_1.PaymentsModule,
            expenses_module_1.ExpensesModule,
            dashboard_module_1.DashboardModule,
            documents_module_1.DocumentsModule,
            tasks_module_1.TasksModule,
            tickets_module_1.TicketsModule,
            subscriptions_module_1.SubscriptionsModule,
            kpis_module_1.KpisModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map