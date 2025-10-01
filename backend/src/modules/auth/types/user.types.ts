// src/auth/types/user.types.ts
import { UserRole } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  phone: string | null;
  avatar: string | null;
  isActive: boolean;
  tenantId: string;
  tenant: {
    id: string;
    name: string;
  };
  userTenants: Array<{
    tenantId: string;
    role: UserRole;
    tenant: {
      id: string;
      name: string;
    };
  }>;
  ownedProperties: Array<{
    id: string;
    name: string;
  }>;
}
