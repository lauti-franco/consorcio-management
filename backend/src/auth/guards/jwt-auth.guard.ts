// src/auth/guards/jwt-auth.guard.ts - VERSIÓN MEJORADA
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // Agregar lógica adicional de verificación si es necesario
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    // Puedes personalizar los mensajes de error aquí
    if (err || !user) {
      throw err || new UnauthorizedException('Token inválido o expirado');
    }
    
    // Asegurar que el usuario tenga la estructura esperada
    if (!user.id || !user.role) {
      throw new UnauthorizedException('Token mal formado');
    }
    
    return user;
  }
}