import { User as PrismaUser } from '@prisma/client';
export interface UserWithTenant extends PrismaUser {
    tenantId?: string;
}
