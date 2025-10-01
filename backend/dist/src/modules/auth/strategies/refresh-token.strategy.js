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
exports.RefreshTokenStrategy = void 0;
const passport_1 = require("passport");
const passport_2 = require("@nestjs/passport");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../shared/database/prisma.service");
const bcrypt = require("bcryptjs");
let RefreshTokenStrategy = class RefreshTokenStrategy extends (0, passport_2.PassportStrategy)(passport_1.Strategy, 'refresh') {
    constructor(prisma) {
        super();
        this.prisma = prisma;
    }
    async validate(req) {
        const refreshToken = req.body.refreshToken;
        if (!refreshToken) {
            throw new common_1.UnauthorizedException('Refresh token is required');
        }
        const tokenRecord = await this.prisma.refreshToken.findFirst({
            where: {
                tokenHash: await bcrypt.hash(refreshToken, 12),
                expiresAt: { gt: new Date() },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        role: true,
                        isActive: true,
                    },
                },
            },
        });
        if (!tokenRecord) {
            throw new common_1.UnauthorizedException('Refresh token invÃ¡lido o expirado');
        }
        if (!tokenRecord.user.isActive) {
            throw new common_1.UnauthorizedException('Usuario inactivo');
        }
        await this.prisma.refreshToken.delete({
            where: { id: tokenRecord.id },
        });
        return {
            userId: tokenRecord.userId,
            user: tokenRecord.user,
            refreshToken,
        };
    }
};
exports.RefreshTokenStrategy = RefreshTokenStrategy;
exports.RefreshTokenStrategy = RefreshTokenStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RefreshTokenStrategy);
//# sourceMappingURL=refresh-token.strategy.js.map