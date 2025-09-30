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
exports.TenantMiddleware = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let TenantMiddleware = class TenantMiddleware {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async use(req, res, next) {
        try {
            let tenantId;
            if (req.headers['x-tenant-id']) {
                tenantId = req.headers['x-tenant-id'];
            }
            else if (req.user?.tenantId) {
                tenantId = req.user.tenantId;
            }
            else if (req.query.tenantId) {
                tenantId = req.query.tenantId;
            }
            if (!tenantId) {
                throw new common_1.BadRequestException('Tenant ID is required. Please provide via X-Tenant-ID header');
            }
            tenantId = tenantId.trim();
            const tenant = await this.prisma.tenant.findUnique({
                where: {
                    id: tenantId,
                    isActive: true
                }
            });
            if (!tenant) {
                throw new common_1.ForbiddenException('Tenant not found or inactive');
            }
            if (req.user?.id) {
                const userTenant = await this.prisma.userTenant.findUnique({
                    where: {
                        userId_tenantId: {
                            userId: req.user.id,
                            tenantId: tenant.id
                        }
                    }
                });
                if (!userTenant) {
                    throw new common_1.ForbiddenException('User does not have access to this tenant');
                }
                req.userTenantRole = userTenant.role;
                req.user.role = userTenant.role;
                req.user.tenantId = tenant.id;
            }
            req.tenant = tenant;
            next();
        }
        catch (error) {
            console.error('TenantMiddleware Error:', error);
            next(error);
        }
    }
};
exports.TenantMiddleware = TenantMiddleware;
exports.TenantMiddleware = TenantMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TenantMiddleware);
//# sourceMappingURL=tenant.middleware.js.map