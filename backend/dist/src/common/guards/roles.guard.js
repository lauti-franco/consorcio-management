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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
let RolesGuard = class RolesGuard {
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const requiredRoles = this.reflector.get('roles', context.getHandler());
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const userRole = this.getUserRole(request);
        if (!userRole) {
            throw new common_1.ForbiddenException('No se pudo determinar el rol del usuario');
        }
        const hasRole = requiredRoles.some((role) => userRole === role);
        if (!hasRole) {
            throw new common_1.ForbiddenException(`Permisos insuficientes. Roles requeridos: ${requiredRoles.join(', ')}. Tu rol: ${userRole}`);
        }
        return true;
    }
    getUserRole(request) {
        if (request.user?.role) {
            return request.user.role;
        }
        if (request.userTenantRole) {
            return request.userTenantRole;
        }
        if (request.user?.userTenants) {
            const tenantId = request.tenant?.id;
            if (tenantId) {
                const userTenant = request.user.userTenants.find((ut) => ut.tenantId === tenantId);
                if (userTenant) {
                    return userTenant.role;
                }
            }
        }
        return null;
    }
};
exports.RolesGuard = RolesGuard;
exports.RolesGuard = RolesGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], RolesGuard);
//# sourceMappingURL=roles.guard.js.map