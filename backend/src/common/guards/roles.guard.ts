// src/common/guards/roles.guard.ts - VERSIÓN MEJORADA
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<UserRole[]>('roles', context.getHandler());
    
    // Si no hay roles requeridos, permitir acceso
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    
    // Múltiples formas de obtener el rol del usuario
    const userRole = this.getUserRole(request);
    
    if (!userRole) {
      throw new ForbiddenException('No se pudo determinar el rol del usuario');
    }

    const hasRole = requiredRoles.some((role) => userRole === role);
    
    if (!hasRole) {
      throw new ForbiddenException(
        `Permisos insuficientes. Roles requeridos: ${requiredRoles.join(', ')}. Tu rol: ${userRole}`
      );
    }

    return true;
  }

  private getUserRole(request: any): UserRole | null {
    // Prioridad 1: user.role (del token JWT)
    if (request.user?.role) {
      return request.user.role;
    }
    
    // Prioridad 2: userTenantRole (de la relación user-tenant)
    if (request.userTenantRole) {
      return request.userTenantRole;
    }
    
    // Prioridad 3: Buscar en userTenants array
    if (request.user?.userTenants) {
      const tenantId = request.tenant?.id;
      if (tenantId) {
        const userTenant = request.user.userTenants.find(
          (ut: any) => ut.tenantId === tenantId
        );
        if (userTenant) {
          return userTenant.role;
        }
      }
    }
    
    return null;
  }
}