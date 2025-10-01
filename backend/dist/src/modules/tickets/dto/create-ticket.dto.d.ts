import { Priority, TicketStatus } from '@prisma/client';
export declare class CreateTicketDto {
    title: string;
    description: string;
    priority?: Priority;
    status?: TicketStatus;
    category: string;
    propertyId: string;
    unitId?: string;
    assignedTo?: string;
    photos?: string[];
}
