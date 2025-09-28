import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(currentUserId: string, currentUserRole: UserRole, role?: UserRole, buildingId?: string): Promise<{
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
    findOne(id: string, currentUserId: string, currentUserRole: UserRole): Promise<{
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
    update(id: string, updateData: any, currentUserId: string, currentUserRole: UserRole): Promise<{
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
    }>;
    deactivate(id: string, currentUserId: string, currentUserRole: UserRole): Promise<{
        id: string;
        name: string;
        email: string;
        isActive: boolean;
    }>;
    remove(id: string, currentUserId: string, currentUserRole: UserRole): Promise<{
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
    getUserStats(userId: string): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
        stats: {
            ownedBuildings: number;
            managedUnits: number;
            createdTasks: number;
            assignedTasks: number;
            tickets: number;
        };
        buildings: {
            id: string;
            name: string;
            units: number;
            expenses: number;
            tickets: number;
        }[];
    }>;
    private verifyUserAccess;
}
