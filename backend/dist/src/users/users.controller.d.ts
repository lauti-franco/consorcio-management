import { Request } from 'express';
import { UserRole } from '@prisma/client';
import { UsersService } from './users.service';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    findAll(req: Request, role?: UserRole, propertyId?: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        userTenants: {
            tenant: {
                id: string;
                name: string;
            };
            role: import(".prisma/client").$Enums.UserRole;
        }[];
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        phone: string;
        avatar: string;
        emailVerified: boolean;
        lastLogin: Date;
        subscription: {
            plan: import(".prisma/client").$Enums.PlanType;
            status: import(".prisma/client").$Enums.SubscriptionStatus;
            currentPeriodEnd: Date;
        };
        ownedProperties: {
            id: string;
            name: string;
        }[];
        managedUnits: {
            number: string;
            id: string;
            property: {
                id: string;
                name: string;
            };
        }[];
    }[]>;
    findOne(id: string, req: Request): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        userTenants: {
            tenant: {
                id: string;
                name: string;
            };
            role: import(".prisma/client").$Enums.UserRole;
        }[];
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        phone: string;
        avatar: string;
        emailVerified: boolean;
        lastLogin: Date;
        subscription: {
            id: string;
            plan: import(".prisma/client").$Enums.PlanType;
            status: import(".prisma/client").$Enums.SubscriptionStatus;
            currentPeriodStart: Date;
            currentPeriodEnd: Date;
            features: import("@prisma/client/runtime/library").JsonValue;
        };
        ownedProperties: {
            id: string;
            name: string;
            address: string;
            _count: {
                expenses: number;
                units: number;
                tickets: number;
            };
        }[];
        managedUnits: {
            number: string;
            id: string;
            property: {
                id: string;
                name: string;
                address: string;
            };
            floor: number;
            type: import(".prisma/client").$Enums.UnitType;
            area: number;
            _count: {
                expenses: number;
                payments: number;
                tickets: number;
            };
        }[];
    }>;
    update(id: string, updateData: any, req: Request): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        phone: string;
        avatar: string;
        emailVerified: boolean;
        lastLogin: Date;
    }>;
    remove(id: string, req: Request): Promise<{
        id: string;
        role: import(".prisma/client").$Enums.UserRole;
        userId: string;
        tenantId: string;
    }>;
    deactivate(id: string, req: Request): Promise<{
        message: string;
        userId: string;
        tenantId: string;
    }>;
    getUserStats(id: string, req: Request): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
        stats: {
            ownedProperties: number;
            managedUnits: number;
            createdTasks: number;
            assignedTasks: number;
            tickets: number;
        };
        properties: {
            id: string;
            name: string;
            units: number;
            expenses: number;
            tickets: number;
        }[];
    }>;
}
