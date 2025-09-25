// src/auth/auth.service.ts - VERSIÓN CORREGIDA
import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
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

    // Verificar si el usuario ya existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('El usuario ya existe');
    }

    // Validar que residentes tengan buildingId
    if (role === 'RESIDENT' && !buildingId) {
      throw new BadRequestException('Los residentes deben estar asignados a un edificio');
    }

    // Hash de la contraseña - campo CORRECTO: "password"
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword, // ← CAMPO CORRECTO
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

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Buscar usuario incluyendo el password para comparar
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { 
        building: true 
      },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Comparar contraseña - campo CORRECTO: "password"
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const tokens = await this.generateTokens(user.id);
    
    // Remover password de la respuesta
    const { passwordHash: _, ...userWithoutPassword } = user;
    
    return {
      message: 'Login exitoso',
      data: {
        user: userWithoutPassword,
        ...tokens,
      },
    };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    // Lógica de refresh token (igual que antes)
    const token = await this.prisma.refreshToken.findFirst({
      where: {
        userId,
        tokenHash: await bcrypt.hash(refreshToken, 12),
        expiresAt: { gt: new Date() },
      },
    });

    if (!token) {
      throw new UnauthorizedException('Refresh token inválido');
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
    
    return { message: 'Logout exitoso' };
  }

  private async generateTokens(userId: string) {
    const payload = { sub: userId };
    
    const accessToken = this.jwtService.sign(payload, { 
      expiresIn: '15m' 
    });
    
    const refreshToken = this.generateRandomToken();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 días

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