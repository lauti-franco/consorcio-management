
import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, name, role } = registerDto;

    // Verificar si el usuario ya existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('El usuario ya existe');
    }

    // Crear usuario - SIN buildingId (ya no existe en el schema)
    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        passwordHash: await bcrypt.hash(password, 12),
        role: role || UserRole.RESIDENT,
        // REMOVED: buildingId ya no existe en el schema
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

    // Si es ADMIN, crear suscripción automáticamente
    if (role === UserRole.ADMIN) {
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
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
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

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Buscar usuario incluyendo relaciones necesarias
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { 
        subscription: true,
        managedUnits: {
          include: {
            building: true,
          },
          take: 5, // Limitar unidades para no sobrecargar
        },
        ownedBuildings: {
          take: 5, // Limitar edificios para no sobrecargar
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      throw new UnauthorizedException('La cuenta está desactivada');
    }

    // Comparar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Actualizar último login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const tokens = await this.generateTokens(user.id);
    
    // Remover passwordHash de la respuesta
    const { passwordHash, ...userWithoutPassword } = user;
    
    return {
      message: 'Login exitoso',
      data: {
        user: userWithoutPassword,
        ...tokens,
      },
    };
  }

  async validateUser(payload: any) {
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
      throw new UnauthorizedException('Usuario no válido o inactivo');
    }

    return user;
  }

  async refreshTokens(refreshToken: string) {
    // Buscar token válido
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
      throw new UnauthorizedException('Refresh token inválido');
    }

    // Eliminar el token usado
    await this.prisma.refreshToken.delete({
      where: { id: tokenRecord.id },
    });

    // Generar nuevos tokens
    return this.generateTokens(tokenRecord.userId);
  }

  async logout(userId: string) {
    // Eliminar todos los refresh tokens del usuario
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
    
    return { message: 'Logout exitoso' };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // Verificar contraseña actual
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Contraseña actual incorrecta');
    }

    // Actualizar contraseña
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: await bcrypt.hash(newPassword, 12),
      },
    });

    return { message: 'Contraseña actualizada exitosamente' };
  }

  private async generateTokens(userId: string) {
    const payload = { sub: userId };
    
    const accessToken = this.jwtService.sign(payload, { 
      expiresIn: process.env.JWT_EXPIRES_IN || '7d' 
    });
    
    const refreshToken = this.generateRandomToken();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 días

    // Guardar refresh token
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

  private generateRandomToken(): string {
    return require('crypto').randomBytes(64).toString('hex');
  }
}
