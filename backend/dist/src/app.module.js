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
const config_1 = require("@nestjs/config");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const configuration_1 = require("./config/configuration");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const buildings_module_1 = require("./buildings/buildings.module");
const expenses_module_1 = require("./expenses/expenses.module");
const payments_module_1 = require("./payments/payments.module");
const tickets_module_1 = require("./tickets/tickets.module");
const tasks_module_1 = require("./tasks/tasks.module");
const files_module_1 = require("./files/files.module");
const prisma_module_1 = require("./prisma/prisma.module");
const subscriptions_module_1 = require("./subscriptions/subscriptions.module");
const units_module_1 = require("./units/units.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const documents_module_1 = require("./documents/documents.module");
const kpis_module_1 = require("./kpis/kpis.module");
const tenant_middleware_1 = require("./common/middleware/tenant.middleware");
let AppModule = class AppModule {
    configure(consumer) {
        consumer
            .apply(tenant_middleware_1.TenantMiddleware)
            .exclude('auth/(.*)', 'health', 'api', 'api/(.*)', 'docs', 'docs/(.*)', 'uploads/(.*)', 'files/public/(.*)', 'webhooks/(.*)', 'payments/webhook/(.*)', 'public/(.*)')
            .forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [configuration_1.default],
                envFilePath: '.env',
            }),
            platform_express_1.MulterModule.register({
                storage: (0, multer_1.diskStorage)({
                    destination: './uploads',
                    filename: (req, file, callback) => {
                        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                        const ext = (0, path_1.extname)(file.originalname);
                        callback(null, `${uniqueSuffix}${ext}`);
                    },
                }),
                limits: {
                    fileSize: 10 * 1024 * 1024,
                },
            }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            buildings_module_1.BuildingsModule,
            expenses_module_1.ExpensesModule,
            payments_module_1.PaymentsModule,
            tickets_module_1.TicketsModule,
            tasks_module_1.TasksModule,
            files_module_1.FilesModule,
            subscriptions_module_1.SubscriptionsModule,
            units_module_1.UnitsModule,
            dashboard_module_1.DashboardModule,
            documents_module_1.DocumentsModule,
            kpis_module_1.KpisModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map