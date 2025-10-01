import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  
  async use(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.headers['x-tenant-id'] as string || 
                    (req as any).user?.tenantId ||
                    req.query.tenantId as string;

    if (tenantId) {
      // Por ahora solo asignamos el tenantId
      // Más tarde inyectaremos el TenantService cuando esté disponible
      (req as any).tenantId = tenantId;
    }
    
    next();
  }
}
