import { UnitType } from '@prisma/client';
export declare class CreateUnitDto {
    number: string;
    floor: number;
    type: UnitType;
    area: number;
    bedrooms?: number;
    bathrooms?: number;
    features?: string[];
    managerId?: string;
    buildingId: string;
}
