import { BuildingsService } from './buildings.service';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';
export declare class BuildingsController {
    private readonly buildingsService;
    constructor(buildingsService: BuildingsService);
    create(createBuildingDto: CreateBuildingDto, userId: string): Promise<{
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
        address: string;
        city: string;
        settings: import("@prisma/client/runtime/library").JsonValue;
        ownerId: string;
    }>;
    findAll(userId: string, userRole: string): Promise<({
        owner: {
            id: string;
            name: string;
            email: string;
        };
        _count: {
            expenses: number;
            tickets: number;
            units: number;
        };
    } & {
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        address: string;
        city: string;
        settings: import("@prisma/client/runtime/library").JsonValue;
        ownerId: string;
    })[]>;
    findOne(id: string, userId: string, userRole: string): Promise<{
        owner: {
            id: string;
            name: string;
            email: string;
            phone: string;
        };
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
            features: string[];
            floor: number;
            type: import(".prisma/client").$Enums.UnitType;
            area: number;
            bedrooms: number | null;
            bathrooms: number | null;
            isOccupied: boolean;
            buildingId: string;
            managerId: string | null;
        })[];
        _count: {
            expenses: number;
            tickets: number;
            units: number;
        };
    } & {
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        address: string;
        city: string;
        settings: import("@prisma/client/runtime/library").JsonValue;
        ownerId: string;
    }>;
    update(id: string, updateBuildingDto: UpdateBuildingDto, userId: string): Promise<{
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
        address: string;
        city: string;
        settings: import("@prisma/client/runtime/library").JsonValue;
        ownerId: string;
    }>;
    remove(id: string, userId: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        address: string;
        city: string;
        settings: import("@prisma/client/runtime/library").JsonValue;
        ownerId: string;
    }>;
}
