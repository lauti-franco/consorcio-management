import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
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
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private prisma;
    private configService;
    constructor(prisma: PrismaService, configService: ConfigService);
    validate(payload: any): Promise<AuthenticatedUser>;
}
export {};
