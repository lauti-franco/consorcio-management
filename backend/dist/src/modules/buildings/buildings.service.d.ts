import { PrismaService } from '../../shared/database/prisma.service';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';
import { UserRole } from '@prisma/client';
export declare class BuildingsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createBuildingDto: CreateBuildingDto & {
        tenantId: string;
        ownerId: string;
    }): Promise<{
        tenant: {
            id: string;
            name: string;
        };
        owner: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        address: string;
        city: string;
        settings: import("@prisma/client/runtime/library").JsonValue;
        ownerId: string;
    }>;
    findAllByTenant(tenantId: string): Promise<({
        owner: {
            id: string;
            name: string;
            email: string;
        };
        _count: {
            expenses: number;
            units: number;
            tickets: number;
        };
    } & {
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        address: string;
        city: string;
        settings: import("@prisma/client/runtime/library").JsonValue;
        ownerId: string;
    })[]>;
    findOne(id: string, tenantId: string): Promise<{
        units: ({
            manager: {
                id: string;
                name: string;
                email: string;
                phone: string;
            };
        } & {
            number: string;
            id: string;
            tenantId: string;
            features: string[];
            floor: number;
            type: import(".prisma/client").$Enums.UnitType;
            area: number | null;
            bedrooms: number | null;
            bathrooms: number | null;
            isOccupied: boolean;
            propertyId: string;
            managerId: string | null;
        })[];
        owner: {
            id: string;
            name: string;
            email: string;
            phone: string;
        };
        _count: {
            expenses: number;
            units: number;
            tickets: number;
        };
    } & {
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        address: string;
        city: string;
        settings: import("@prisma/client/runtime/library").JsonValue;
        ownerId: string;
    }>;
    update(id: string, updateBuildingDto: UpdateBuildingDto, tenantId: string): Promise<{
        tenant: {
            id: string;
            name: string;
        };
        owner: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        address: string;
        city: string;
        settings: import("@prisma/client/runtime/library").JsonValue;
        ownerId: string;
    }>;
    remove(id: string, tenantId: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        address: string;
        city: string;
        settings: import("@prisma/client/runtime/library").JsonValue;
        ownerId: string;
    }>;
    getPropertyStats(id: string, tenantId: string): Promise<{
        totalUnits: number;
        occupiedUnits: number;
        activeTickets: number;
        pendingExpenses: number;
        monthlyRevenue: number;
        totalResidents: number;
        occupancyRate: number;
    }>;
    private verifyPropertyExists;
    verifyPropertyAccess(propertyId: string, userId: string, userRole: UserRole, tenantId: string): Promise<true | {
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        address: string;
        city: string;
        settings: import("@prisma/client/runtime/library").JsonValue;
        ownerId: string;
    }>;
}
