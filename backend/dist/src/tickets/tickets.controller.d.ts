import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
export declare class TicketsController {
    private readonly ticketsService;
    constructor(ticketsService: TicketsService);
    create(createTicketDto: CreateTicketDto, req: any): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            phone: string;
        };
        building: {
            id: string;
            name: string;
            address: string;
        };
        unit: {
            number: string;
            id: string;
            floor: number;
        };
        assignedTo: {
            id: string;
            name: string;
            email: string;
            phone: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TicketStatus;
        userId: string;
        buildingId: string;
        unitId: string | null;
        title: string;
        description: string;
        priority: import(".prisma/client").$Enums.Priority;
        category: string;
        photos: string[];
        assignedToId: string | null;
    }>;
    findAll(req: any, buildingId?: string): Promise<({
        user: {
            id: string;
            name: string;
            email: string;
            phone: string;
        };
        building: {
            id: string;
            name: string;
            address: string;
        };
        unit: {
            number: string;
            id: string;
            floor: number;
        };
        assignedTo: {
            id: string;
            name: string;
            email: string;
            phone: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TicketStatus;
        userId: string;
        buildingId: string;
        unitId: string | null;
        title: string;
        description: string;
        priority: import(".prisma/client").$Enums.Priority;
        category: string;
        photos: string[];
        assignedToId: string | null;
    })[]>;
    findOne(id: string, req: any): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            phone: string;
        };
        building: {
            id: string;
            name: string;
            address: string;
        };
        unit: {
            number: string;
            id: string;
            floor: number;
        };
        assignedTo: {
            id: string;
            name: string;
            email: string;
            phone: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TicketStatus;
        userId: string;
        buildingId: string;
        unitId: string | null;
        title: string;
        description: string;
        priority: import(".prisma/client").$Enums.Priority;
        category: string;
        photos: string[];
        assignedToId: string | null;
    }>;
    update(id: string, updateTicketDto: UpdateTicketDto, req: any): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            phone: string;
        };
        building: {
            id: string;
            name: string;
            address: string;
        };
        unit: {
            number: string;
            id: string;
            floor: number;
        };
        assignedTo: {
            id: string;
            name: string;
            email: string;
            phone: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TicketStatus;
        userId: string;
        buildingId: string;
        unitId: string | null;
        title: string;
        description: string;
        priority: import(".prisma/client").$Enums.Priority;
        category: string;
        photos: string[];
        assignedToId: string | null;
    }>;
    remove(id: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TicketStatus;
        userId: string;
        buildingId: string;
        unitId: string | null;
        title: string;
        description: string;
        priority: import(".prisma/client").$Enums.Priority;
        category: string;
        photos: string[];
        assignedToId: string | null;
    }>;
    assignToMe(id: string, req: any): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            phone: string;
        };
        building: {
            id: string;
            name: string;
            address: string;
        };
        unit: {
            number: string;
            id: string;
            floor: number;
        };
        assignedTo: {
            id: string;
            name: string;
            email: string;
            phone: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TicketStatus;
        userId: string;
        buildingId: string;
        unitId: string | null;
        title: string;
        description: string;
        priority: import(".prisma/client").$Enums.Priority;
        category: string;
        photos: string[];
        assignedToId: string | null;
    }>;
    completeTicket(id: string, req: any): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            phone: string;
        };
        building: {
            id: string;
            name: string;
            address: string;
        };
        unit: {
            number: string;
            id: string;
            floor: number;
        };
        assignedTo: {
            id: string;
            name: string;
            email: string;
            phone: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TicketStatus;
        userId: string;
        buildingId: string;
        unitId: string | null;
        title: string;
        description: string;
        priority: import(".prisma/client").$Enums.Priority;
        category: string;
        photos: string[];
        assignedToId: string | null;
    }>;
    addPhoto(id: string, photoUrl: string, req: any): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            phone: string;
        };
        building: {
            id: string;
            name: string;
            address: string;
        };
        unit: {
            number: string;
            id: string;
            floor: number;
        };
        assignedTo: {
            id: string;
            name: string;
            email: string;
            phone: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TicketStatus;
        userId: string;
        buildingId: string;
        unitId: string | null;
        title: string;
        description: string;
        priority: import(".prisma/client").$Enums.Priority;
        category: string;
        photos: string[];
        assignedToId: string | null;
    }>;
    getStats(req: any, buildingId?: string): Promise<{
        total: number;
        open: number;
        inProgress: number;
        resolved: number;
        resolvedPercentage: number;
    }>;
}
