import { Request } from 'express';
import { UserRole } from '../common/enums/user-role.enum';
import { UsersService } from './users.service';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    findAll(req: Request, role?: UserRole, buildingId?: string): Promise<{
        id: string;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        phone: string;
        avatar: string;
        isActive: boolean;
        emailVerified: boolean;
        lastLogin: Date;
        createdAt: Date;
        updatedAt: Date;
        subscription: {
            plan: import(".prisma/client").$Enums.PlanType;
            status: import(".prisma/client").$Enums.SubscriptionStatus;
            currentPeriodEnd: Date;
        };
        ownedBuildings: {
            id: string;
            name: string;
        }[];
        managedUnits: {
            number: string;
            id: string;
            building: {
                id: string;
                name: string;
            };
        }[];
    }[]>;
    findOne(id: string, req: Request): Promise<{
        id: string;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        phone: string;
        avatar: string;
        isActive: boolean;
        emailVerified: boolean;
        lastLogin: Date;
        createdAt: Date;
        updatedAt: Date;
        subscription: {
            id: string;
            plan: import(".prisma/client").$Enums.PlanType;
            status: import(".prisma/client").$Enums.SubscriptionStatus;
            currentPeriodStart: Date;
            currentPeriodEnd: Date;
            features: import("@prisma/client/runtime/library").JsonValue;
        };
        ownedBuildings: {
            id: string;
            name: string;
            address: string;
            _count: {
                expenses: number;
                tickets: number;
                units: number;
            };
        }[];
        managedUnits: {
            number: string;
            id: string;
            building: {
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
    remove(id: string, req: Request): Promise<{
        id: string;
        name: string;
        email: string;
        passwordHash: string;
        role: import(".prisma/client").$Enums.UserRole;
        phone: string | null;
        avatar: string | null;
        isActive: boolean;
        emailVerified: boolean;
        lastLogin: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
