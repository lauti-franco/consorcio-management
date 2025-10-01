import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantService } from './tenant.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private tenantService: TenantService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.headers['x-tenant-id'] as string || 
                    (req as any).user?.tenantId ||
                    req.query.tenantId as string;

    if (tenantId) {
      try {
        const tenant = await this.tenantService.validateTenant(tenantId);
        if (tenant) {
          (req as any).tenant = tenant;
          (req as any).tenantId = tenantId;
        }
      } catch (error) {
        console.warn('Tenant validation failed:', error.message);
      }
    }
    
    next();
  }
}
