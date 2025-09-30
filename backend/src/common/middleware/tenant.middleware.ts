// src/common/middleware/tenant.middleware.ts - VERSIÓN SIN INTERFACES
import { Injectable, NestMiddleware, ForbiddenException, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      // 1. Obtener tenantId de diferentes fuentes
      let tenantId: string | undefined;

      if (req.headers['x-tenant-id']) {
        tenantId = req.headers['x-tenant-id'] as string;
      } else if ((req as any).user?.tenantId) {
        tenantId = (req as any).user.tenantId;
      } else if (req.query.tenantId) {
        tenantId = req.query.tenantId as string;
      }

      if (!tenantId) {
        throw new BadRequestException('Tenant ID is required. Please provide via X-Tenant-ID header');
      }

      tenantId = tenantId.trim();

      // 2. Validar que el tenant existe y está activo
      const tenant = await this.prisma.tenant.findUnique({
        where: { 
          id: tenantId,
          isActive: true 
        }
      });

      if (!tenant) {
        throw new ForbiddenException('Tenant not found or inactive');
      }

      // 3. Si el usuario está autenticado, verificar acceso al tenant
      if ((req as any).user?.id) {
        const userTenant = await this.prisma.userTenant.findUnique({
          where: {
            userId_tenantId: {
              userId: (req as any).user.id,
              tenantId: tenant.id
            }
          }
        });

        if (!userTenant) {
          throw new ForbiddenException('User does not have access to this tenant');
        }

        // Asignar información al request
        (req as any).userTenantRole = userTenant.role;
        (req as any).user.role = userTenant.role;
        (req as any).user.tenantId = tenant.id;
      }

      // 4. Adjuntar tenant al request
      (req as any).tenant = tenant;

      next();
    } catch (error) {
      console.error('TenantMiddleware Error:', error);
      next(error);
    }
  }
}