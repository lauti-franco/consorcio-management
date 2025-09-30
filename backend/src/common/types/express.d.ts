// src/common/types/express.d.ts
import { UserRole } from '../enums/user-role.enum';

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: UserRole;
      name: string;
      tenantId?: string;
    }

    interface Request {
      tenant?: {
        id: string;
        name: string;
        description?: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
      };
      userTenantRole?: UserRole;
    }
  }
}