// src/core/interceptors/tenant.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const tenant = request.tenant;

    // AquÃ­ puedes inyectar automÃ¡ticamente el tenantId en los queries
    // si es necesario para ciertos servicios

    return next.handle().pipe(
      tap(() => {
        // Post-processing si es necesario
      })
    );
  }
}
