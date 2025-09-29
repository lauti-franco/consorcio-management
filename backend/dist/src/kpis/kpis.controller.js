"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KpisController = void 0;
const common_1 = require("@nestjs/common");
const kpis_service_1 = require("./kpis.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
let KpisController = class KpisController {
    constructor(kpisService) {
        this.kpisService = kpisService;
    }
    getAdvancedKPIs(req, period = '30d') {
        return this.kpisService.getAdvancedKPIs(req.tenant.id, req.user.id, period);
    }
    getFinancialKPIs(req, period = '30d') {
        return this.kpisService.getAdvancedKPIs(req.tenant.id, req.user.id, period)
            .then(kpis => kpis.financial);
    }
    getMaintenanceKPIs(req, period = '30d') {
        return this.kpisService.getAdvancedKPIs(req.tenant.id, req.user.id, period)
            .then(kpis => kpis.maintenance);
    }
};
exports.KpisController = KpisController;
__decorate([
    (0, common_1.Get)('advanced'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get advanced KPIs for dashboard' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], KpisController.prototype, "getAdvancedKPIs", null);
__decorate([
    (0, common_1.Get)('financial'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get financial KPIs' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], KpisController.prototype, "getFinancialKPIs", null);
__decorate([
    (0, common_1.Get)('maintenance'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN, client_1.UserRole.MAINTENANCE),
    (0, swagger_1.ApiOperation)({ summary: 'Get maintenance KPIs' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], KpisController.prototype, "getMaintenanceKPIs", null);
exports.KpisController = KpisController = __decorate([
    (0, swagger_1.ApiTags)('kpis'),
    (0, common_1.Controller)('kpis'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [kpis_service_1.KpisService])
], KpisController);
//# sourceMappingURL=kpis.controller.js.map