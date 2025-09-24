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
            throw new common_1.BadRequestException('User already exists');
        }
        if (role === 'RESIDENT' && !buildingId) {
            throw new common_1.BadRequestException('Residents must be assigned to a building');
        }
        const passwordHash = await bcrypt.hash(password, 12);
        const user = await this.prisma.user.create({
            data: {
                email,
                passwordHash,
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
            },
        });
        const tokens = await this.generateTokens(user.id);
        return { user, ...tokens };
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: { building: true },
        });
        if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const tokens = await this.generateTokens(user.id);
        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                buildingId: user.buildingId,
                building: user.building,
            },
            ...tokens,
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
            throw new common_1.UnauthorizedException('Invalid refresh token');
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
    }
    async generateTokens(userId) {
        const accessToken = this.jwtService.sign({ userId });
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