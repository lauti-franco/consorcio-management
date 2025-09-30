import { Request } from 'express';
import { BuildingsService } from './buildings.service';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';
export declare class BuildingsController {
    private readonly buildingsService;
    constructor(buildingsService: BuildingsService);
    create(req: Request, createBuildingDto: CreateBuildingDto): Promise<{
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
    findAll(req: Request): Promise<({
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
    findOne(req: Request, id: string): Promise<{
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
    update(req: Request, id: string, updateBuildingDto: UpdateBuildingDto): Promise<{
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
    remove(req: Request, id: string): Promise<{
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
    getStats(req: Request, id: string): Promise<{
        totalUnits: number;
        occupiedUnits: number;
        activeTickets: number;
        pendingExpenses: number;
        monthlyRevenue: number;
        totalResidents: number;
        occupancyRate: number;
    }>;
    getTenantInfo(req: Request): {
        tenant: {
            id: string;
            name: string;
            description: string;
        };
        userRole: UserRole;
        message: string;
    };
}
