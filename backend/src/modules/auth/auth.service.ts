// src/modules/auth/auth.service.ts - CORREGIDO
import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config'; // ← AGREGAR ESTE IMPORT
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto'; // ← AGREGAR ESTE IMPORT
import { PrismaService } from '../../shared/database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole, PlanType, SubscriptionStatus } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService, // ← AGREGAR EN CONSTRUCTOR
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, name, role, tenantId } = registerDto;

    // Verificar si el usuario ya existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('El usuario ya existe');
    }

    // Crear usuario
    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        passwordHash: await bcrypt.hash(password, 12),
        role: role || UserRole.RESIDENT,
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

    // Si se proporcionó tenantId, asociar usuario al tenant
    if (tenantId) {
      await this.prisma.userTenant.create({
        data: {
          userId: user.id,
          tenantId: tenantId,
          role: role || UserRole.RESIDENT,
        },
      });
    }

    // Si es ADMIN y no tiene tenant, crear tenant por defecto
    if (role === UserRole.ADMIN && !tenantId) {
      const defaultTenant = await this.prisma.tenant.create({
        data: {
          name: `${name}'s Consorcio`,
          description: 'Tenant por defecto',
        },
      });

      await this.prisma.userTenant.create({
        data: {
          userId: user.id,
          tenantId: defaultTenant.id,
          role: UserRole.ADMIN,
        },
      });

      // Crear suscripción para el admin
      await this.prisma.subscription.create({
        data: {
          plan: PlanType.STARTER,
          status: SubscriptionStatus.ACTIVE,
          maxProperties: 1,
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

    const tokens = await this.generateTokens(user.id, tenantId);
    
    return { 
      message: 'Usuario registrado exitosamente',
      data: { 
        user, 
        ...tokens,
        tenantId: tenantId || (role === UserRole.ADMIN ? null : tenantId)
      } 
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password, tenantId } = loginDto;

    // Buscar usuario
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { 
        subscription: true,
        managedUnits: {
          include: {
            property: {
              select: {
                id: true,
                name: true,
                tenantId: true
              }
            },
          },
          take: 5,
        },
        ownedProperties: {
          take: 5,
          select: {
            id: true,
            name: true,
            tenantId: true
          }
        },
        userTenants: {
          include: {
            tenant: {
              select: {
                id: true,
                name: true,
                description: true
              }
            }
          }
        }
      },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('La cuenta está desactivada');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Si se proporcionó tenantId, verificar que el usuario tenga acceso
    let selectedTenantId = tenantId;
    if (tenantId) {
      const userTenant = await this.prisma.userTenant.findUnique({
        where: {
          userId_tenantId: {
            userId: user.id,
            tenantId: tenantId
          }
        }
      });

      if (!userTenant) {
        throw new UnauthorizedException('Usuario no tiene acceso a este tenant');
      }
    } else {
      // Si no hay tenantId, usar el primer tenant disponible
      const userTenant = user.userTenants[0];
      if (userTenant) {
        selectedTenantId = userTenant.tenantId;
      }
    }

    // Actualizar último login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const tokens = await this.generateTokens(user.id, selectedTenantId);
    
    // Remover passwordHash de la respuesta
    const { passwordHash, ...userWithoutPassword } = user;
    
    return {
      message: 'Login exitoso',
      data: {
        user: userWithoutPassword,
        ...tokens,
        tenantId: selectedTenantId
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

    // Generar nuevos tokens (sin tenantId específico)
    return this.generateTokens(tokenRecord.userId);
  }

  async logout(userId: string) {
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

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Contraseña actual incorrecta');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: await bcrypt.hash(newPassword, 12),
      },
    });

    return { message: 'Contraseña actualizada exitosamente' };
  }

  private async generateTokens(userId: string, tenantId?: string) {
    const payload = { 
      sub: userId,
      tenantId: tenantId
    };
    
    const accessToken = this.jwtService.sign(payload, { 
      expiresIn: this.configService.get('JWT_EXPIRES_IN') || '7d' // ← USAR ConfigService
    });
    
    const refreshToken = this.generateRandomToken();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 días

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
      expiresIn: this.configService.get('JWT_EXPIRES_IN') || '7d', // ← USAR ConfigService
    };
  }

  private generateRandomToken(): string {
    return crypto.randomBytes(64).toString('hex'); // ← CORREGIDO
  }
}