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
let AuthService = class AuthService {
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async register(registerDto) {
        const { email, password, name, role, buildingId } = registerDto;
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('El usuario ya existe');
        }
        if (role === 'RESIDENT' && !buildingId) {
            throw new common_1.BadRequestException('Los residentes deben estar asignados a un edificio');
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await this.prisma.user.create({
            data: {
                email,
                passwordHash: hashedPassword,
                name,
                role,
                buildingId: role === 'RESIDENT' ? buildingId : null,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                buildingId: true,
                createdAt: true,
                updatedAt: true,
            },
        });
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
                building: true
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        const tokens = await this.generateTokens(user.id);
        const { passwordHash: _, ...userWithoutPassword } = user;
        return {
            message: 'Login exitoso',
            data: {
                user: userWithoutPassword,
                ...tokens,
            },
        };
    }
    async refreshTokens(userId, refreshToken) {
        const token = await this.prisma.refreshToken.findFirst({
            where: {
                userId,
                tokenHash: await bcrypt.hash(refreshToken, 12),
                expiresAt: { gt: new Date() },
            },
        });
        if (!token) {
            throw new common_1.UnauthorizedException('Refresh token inválido');
        }
        await this.prisma.refreshToken.delete({
            where: { id: token.id },
        });
        return this.generateTokens(userId);
    }
    async logout(userId) {
        await this.prisma.refreshToken.deleteMany({
            where: { userId },
        });
        return { message: 'Logout exitoso' };
    }
    async generateTokens(userId) {
        const payload = { sub: userId };
        const accessToken = this.jwtService.sign(payload, {
            expiresIn: '15m'
        });
        const refreshToken = this.generateRandomToken();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
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
        };
    }
    generateRandomToken() {
        return require('crypto').randomBytes(32).toString('hex');
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map