"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("../shared/database/prisma.module");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const roles_guard_1 = require("./guards/roles.guard");
const tenant_guard_1 = require("./guards/tenant.guard");
const logging_interceptor_1 = require("./interceptors/logging.interceptor");
let CoreModule = class CoreModule {
};
exports.CoreModule = CoreModule;
exports.CoreModule = CoreModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [config_1.ConfigModule.forRoot(), prisma_module_1.PrismaModule],
        providers: [
            jwt_auth_guard_1.JwtAuthGuard,
            roles_guard_1.RolesGuard,
            tenant_guard_1.TenantGuard,
            logging_interceptor_1.LoggingInterceptor,
        ],
        exports: [prisma_module_1.PrismaModule],
    })
], CoreModule);
//# sourceMappingURL=core.module.js.map