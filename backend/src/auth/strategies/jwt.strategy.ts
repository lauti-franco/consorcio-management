// src/auth/strategies/jwt.strategy.ts - VERSIÓN MEJORADA
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '@prisma/client';

// Interface para el usuario autenticado
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  phone: string | null;
  avatar: string | null;
  isActive: boolean;
  tenantId: string;
  tenant: {
    id: string;
    name: string;
  };
  userTenants: Array<{
    tenantId: string;
    role: UserRole;
    tenant: {
      id: string;
      name: string;
    };
  }>;
  ownedProperties: Array<{
    id: string;
    name: string;
  }>;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'secret-key',
    });
  }

  async validate(payload: any): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        phone: true,
        avatar: true,
        isActive: true,
        userTenants: {
          select: {
            tenantId: true,
            role: true,
            tenant: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        ownedProperties: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    // Obtener el primer tenant del usuario
    const userTenant = user.userTenants[0];

    if (!userTenant) {
      throw new UnauthorizedException('Usuario no tiene tenant asignado');
    }

    // Retornar estructura consistente
    return {
      ...user,
      tenantId: userTenant.tenantId,
      tenant: userTenant.tenant
    };
  }
}