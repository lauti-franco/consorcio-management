// src/auth/strategies/refresh-token.strategy.ts - MEJORADO
import { Strategy } from 'passport';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor(private prisma: PrismaService) {
    super();
  }

  async validate(req: Request): Promise<any> {
    const refreshToken = req.body.refreshToken;
    
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    // Buscar token válido en la base de datos
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
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    if (!tokenRecord.user.isActive) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    // Eliminar el token usado
    await this.prisma.refreshToken.delete({
      where: { id: tokenRecord.id },
    });

    return {
      userId: tokenRecord.userId,
      user: tokenRecord.user,
      refreshToken,
    };
  }
}