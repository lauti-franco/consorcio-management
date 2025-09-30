import { Request } from 'express';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
export declare class TicketsController {
    private readonly ticketsService;
    constructor(ticketsService: TicketsService);
    create(createTicketDto: CreateTicketDto, req: Request): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            phone: string;
        };
        property: {
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
        description: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        tenantId: string;
        status: import(".prisma/client").$Enums.TicketStatus;
        propertyId: string;
        unitId: string | null;
        title: string;
        priority: import(".prisma/client").$Enums.Priority;
        category: string;
        photos: string[];
        assignedToId: string | null;
    }>;
    findAll(req: Request, propertyId?: string): Promise<({
        user: {
            id: string;
            name: string;
            email: string;
            phone: string;
        };
        property: {
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
        description: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        tenantId: string;
        status: import(".prisma/client").$Enums.TicketStatus;
        propertyId: string;
        unitId: string | null;
        title: string;
        priority: import(".prisma/client").$Enums.Priority;
        category: string;
        photos: string[];
        assignedToId: string | null;
    })[]>;
    findOne(id: string, req: Request): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            phone: string;
        };
        property: {
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
        description: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        tenantId: string;
        status: import(".prisma/client").$Enums.TicketStatus;
        propertyId: string;
        unitId: string | null;
        title: string;
        priority: import(".prisma/client").$Enums.Priority;
        category: string;
        photos: string[];
        assignedToId: string | null;
    }>;
    update(id: string, updateTicketDto: UpdateTicketDto, req: Request): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            phone: string;
        };
        property: {
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
        description: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        tenantId: string;
        status: import(".prisma/client").$Enums.TicketStatus;
        propertyId: string;
        unitId: string | null;
        title: string;
        priority: import(".prisma/client").$Enums.Priority;
        category: string;
        photos: string[];
        assignedToId: string | null;
    }>;
    remove(id: string, req: Request): Promise<{
        id: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        tenantId: string;
        status: import(".prisma/client").$Enums.TicketStatus;
        propertyId: string;
        unitId: string | null;
        title: string;
        priority: import(".prisma/client").$Enums.Priority;
        category: string;
        photos: string[];
        assignedToId: string | null;
    }>;
    assignToMe(id: string, req: Request): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            phone: string;
        };
        property: {
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
        description: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        tenantId: string;
        status: import(".prisma/client").$Enums.TicketStatus;
        propertyId: string;
        unitId: string | null;
        title: string;
        priority: import(".prisma/client").$Enums.Priority;
        category: string;
        photos: string[];
        assignedToId: string | null;
    }>;
    completeTicket(id: string, req: Request): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            phone: string;
        };
        property: {
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
        description: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        tenantId: string;
        status: import(".prisma/client").$Enums.TicketStatus;
        propertyId: string;
        unitId: string | null;
        title: string;
        priority: import(".prisma/client").$Enums.Priority;
        category: string;
        photos: string[];
        assignedToId: string | null;
    }>;
    addPhoto(id: string, photoUrl: string, req: Request): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            phone: string;
        };
        property: {
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
        description: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        tenantId: string;
        status: import(".prisma/client").$Enums.TicketStatus;
        propertyId: string;
        unitId: string | null;
        title: string;
        priority: import(".prisma/client").$Enums.Priority;
        category: string;
        photos: string[];
        assignedToId: string | null;
    }>;
    getStats(req: Request, propertyId?: string): Promise<{
        total: number;
        open: number;
        inProgress: number;
        resolved: number;
        resolvedPercentage: number;
    }>;
}
