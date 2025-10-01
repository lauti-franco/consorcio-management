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
const jwt_auth_guard_1 = require("../../core/guards/jwt-auth.guard");
const kpis_service_1 = require("./kpis.service");
let KpisController = class KpisController {
    constructor(kpisService) {
        this.kpisService = kpisService;
    }
    getAdvancedKPIs(req) {
        const tenantId = req.user?.tenantId || req.tenantId || 'default-tenant';
        return this.kpisService.getAdvancedKPIs(tenantId);
    }
    getBasicKPIs(req) {
        const tenantId = req.user?.tenantId || req.tenantId || 'default-tenant';
        return this.kpisService.getBasicKPIs(tenantId);
    }
    getFinancialKPIs(req) {
        const tenantId = req.user?.tenantId || req.tenantId || 'default-tenant';
        const advancedKPIs = this.kpisService.getAdvancedKPIs(tenantId);
        return advancedKPIs.then(kpis => kpis.financial);
    }
    getMaintenanceKPIs(req) {
        const tenantId = req.user?.tenantId || req.tenantId || 'default-tenant';
        const advancedKPIs = this.kpisService.getAdvancedKPIs(tenantId);
        return advancedKPIs.then(kpis => kpis.maintenance);
    }
    getOccupancyKPIs(req) {
        const tenantId = req.user?.tenantId || req.tenantId || 'default-tenant';
        const advancedKPIs = this.kpisService.getAdvancedKPIs(tenantId);
        return advancedKPIs.then(kpis => kpis.occupancy);
    }
    getPropertyKPIs(req) {
        const tenantId = req.user?.tenantId || req.tenantId || 'default-tenant';
        const advancedKPIs = this.kpisService.getAdvancedKPIs(tenantId);
        return advancedKPIs.then(kpis => kpis.property);
    }
    getTrends(req) {
        const tenantId = req.user?.tenantId || req.tenantId || 'default-tenant';
        const advancedKPIs = this.kpisService.getAdvancedKPIs(tenantId);
        return advancedKPIs.then(kpis => kpis.trends);
    }
};
exports.KpisController = KpisController;
__decorate([
    (0, common_1.Get)('advanced'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], KpisController.prototype, "getAdvancedKPIs", null);
__decorate([
    (0, common_1.Get)('basic'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], KpisController.prototype, "getBasicKPIs", null);
__decorate([
    (0, common_1.Get)('financial'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], KpisController.prototype, "getFinancialKPIs", null);
__decorate([
    (0, common_1.Get)('maintenance'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], KpisController.prototype, "getMaintenanceKPIs", null);
__decorate([
    (0, common_1.Get)('occupancy'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], KpisController.prototype, "getOccupancyKPIs", null);
__decorate([
    (0, common_1.Get)('property'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], KpisController.prototype, "getPropertyKPIs", null);
__decorate([
    (0, common_1.Get)('trends'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], KpisController.prototype, "getTrends", null);
exports.KpisController = KpisController = __decorate([
    (0, common_1.Controller)('kpis'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [kpis_service_1.KpisService])
], KpisController);
//# sourceMappingURL=kpis.controller.js.map