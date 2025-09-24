import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, name, role, buildingId } = registerDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    if (role === 'RESIDENT' && !buildingId) {
      throw new BadRequestException('Residents must be assigned to a building');
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

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { building: true },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
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

  async refreshTokens(userId: string, refreshToken: string) {
    const token = await this.prisma.refreshToken.findFirst({
      where: {
        userId,
        tokenHash: await bcrypt.hash(refreshToken, 12),
        expiresAt: { gt: new Date() },
      },
    });

    if (!token) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.prisma.refreshToken.delete({
      where: { id: token.id },
    });

    return this.generateTokens(userId);
  }

  async logout(userId: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  private async generateTokens(userId: string) {
    const accessToken = this.jwtService.sign({ userId });
    const refreshToken = this.generateRandomToken();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

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

  private generateRandomToken(): string {
    return require('crypto').randomBytes(32).toString('hex');
  }
}