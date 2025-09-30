// src/types/express.d.ts - CORREGIDO
import { Tenant, User, UserRole } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      tenant?: Tenant;
      user?: User;
      userTenantRole?: UserRole;
    }
  }
}

export {};