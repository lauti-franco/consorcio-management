import { Priority } from '@prisma/client';
export declare class CreateTicketDto {
    title: string;
    description: string;
    priority?: Priority;
    category: string;
    buildingId: string;
    unitId?: string;
    assignedTo?: string;
    photos?: string[];
}
