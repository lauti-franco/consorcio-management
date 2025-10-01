import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantService } from './tenant.service';
export declare class TenantMiddleware implements NestMiddleware {
    private tenantService;
    constructor(tenantService: TenantService);
    use(req: Request, res: Response, next: NextFunction): Promise<void>;
}
