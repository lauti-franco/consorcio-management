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
            building: {
                id: string;
                name: string;
                address: string;
                city: string;
                createdAt: Date;
            };
            email: string;
        };
        assignedUser: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TicketStatus;
        userId: string;
        title: string;
        description: string;
        photos: string[];
        assignedTo: string | null;
    }>;
    findAll(req: any): Promise<({
        user: {
            id: string;
            name: string;
            building: {
                id: string;
                name: string;
                address: string;
                city: string;
                createdAt: Date;
            };
            email: string;
        };
        assignedUser: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TicketStatus;
        userId: string;
        title: string;
        description: string;
        photos: string[];
        assignedTo: string | null;
    })[]>;
    findOne(id: string, req: any): Promise<{
        user: {
            id: string;
            name: string;
            building: {
                id: string;
                name: string;
                address: string;
                city: string;
                createdAt: Date;
            };
            email: string;
        };
        assignedUser: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TicketStatus;
        userId: string;
        title: string;
        description: string;
        photos: string[];
        assignedTo: string | null;
    }>;
    update(id: string, updateTicketDto: UpdateTicketDto, req: any): Promise<{
        user: {
            id: string;
            name: string;
            building: {
                id: string;
                name: string;
                address: string;
                city: string;
                createdAt: Date;
            };
            email: string;
        };
        assignedUser: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TicketStatus;
        userId: string;
        title: string;
        description: string;
        photos: string[];
        assignedTo: string | null;
    }>;
    assignToMe(id: string, req: any): Promise<{
        user: {
            id: string;
            name: string;
            building: {
                id: string;
                name: string;
                address: string;
                city: string;
                createdAt: Date;
            };
            email: string;
        };
        assignedUser: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TicketStatus;
        userId: string;
        title: string;
        description: string;
        photos: string[];
        assignedTo: string | null;
    }>;
}
