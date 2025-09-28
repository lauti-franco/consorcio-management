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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcryptjs");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let AuthService = class AuthService {
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async register(registerDto) {
        const { email, password, name, role } = registerDto;
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('El usuario ya existe');
        }
        const user = await this.prisma.user.create({
            data: {
                name,
                email,
                passwordHash: await bcrypt.hash(password, 12),
                role: role || client_1.UserRole.RESIDENT,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                phone: true,
                avatar: true,
                isActive: true,
                emailVerified: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (role === client_1.UserRole.ADMIN) {
            await this.prisma.subscription.create({
                data: {
                    plan: 'STARTER',
                    status: 'ACTIVE',
                    maxBuildings: 1,
                    maxUsers: 10,
                    features: {
                        advancedReports: false,
                        apiAccess: false,
                        customBranding: false,
                        prioritySupport: false
                    },
                    userId: user.id,
                    currentPeriodStart: new Date(),
                    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                },
            });
        }
        const tokens = await this.generateTokens(user.id);
        return {
            message: 'Usuario registrado exitosamente',
            data: {
                user,
                ...tokens
            }
        };
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: {
                subscription: true,
                managedUnits: {
                    include: {
                        building: true,
                    },
                    take: 5,
                },
                ownedBuildings: {
                    take: 5,
                },
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('La cuenta está desactivada');
        }
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
        });
        const tokens = await this.generateTokens(user.id);
        const { passwordHash, ...userWithoutPassword } = user;
        return {
            message: 'Login exitoso',
            data: {
                user: userWithoutPassword,
                ...tokens,
            },
        };
    }
    async validateUser(payload) {
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
                subscription: {
                    select: {
                        plan: true,
                        status: true,
                        features: true,
                    },
                },
            },
        });
        if (!user || !user.isActive) {
            throw new common_1.UnauthorizedException('Usuario no válido o inactivo');
        }
        return user;
    }
    async refreshTokens(refreshToken) {
        const tokenRecord = await this.prisma.refreshToken.findFirst({
            where: {
                tokenHash: await bcrypt.hash(refreshToken, 12),
                expiresAt: { gt: new Date() },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        isActive: true,
                    },
                },
            },
        });
        if (!tokenRecord || !tokenRecord.user.isActive) {
            throw new common_1.UnauthorizedException('Refresh token inválido');
        }
        await this.prisma.refreshToken.delete({
            where: { id: tokenRecord.id },
        });
        return this.generateTokens(tokenRecord.userId);
    }
    async logout(userId) {
        await this.prisma.refreshToken.deleteMany({
            where: { userId },
        });
        return { message: 'Logout exitoso' };
    }
    async changePassword(userId, currentPassword, newPassword) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Usuario no encontrado');
        }
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isCurrentPasswordValid) {
            throw new common_1.BadRequestException('Contraseña actual incorrecta');
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                passwordHash: await bcrypt.hash(newPassword, 12),
            },
        });
        return { message: 'Contraseña actualizada exitosamente' };
    }
    async generateTokens(userId) {
        const payload = { sub: userId };
        const accessToken = this.jwtService.sign(payload, {
            expiresIn: process.env.JWT_EXPIRES_IN || '7d'
        });
        const refreshToken = this.generateRandomToken();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        await this.prisma.refreshToken.create({
            data: {
                userId,
                tokenHash: await bcrypt.hash(refreshToken, 12),
                expiresAt,
            },
        });
        return {
            accessToken,
            refreshToken,
            expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        };
    }
    generateRandomToken() {
        return require('crypto').randomBytes(64).toString('hex');
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map