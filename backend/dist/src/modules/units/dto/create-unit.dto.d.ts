import { UnitType } from '@prisma/client';
export declare class CreateUnitDto {
    number: string;
    floor: number;
    type: UnitType;
    area: number;
    bedrooms?: number;
    bathrooms?: number;
    isOccupied?: boolean;
    features?: string[];
    managerId?: string;
    propertyId: string;
}
