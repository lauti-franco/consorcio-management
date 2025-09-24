import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { UserRole } from '../common/types';
export declare class TicketsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createTicketDto: CreateTicketDto, userId: string): Promise<{
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
    findAll(userId: string, userRole: UserRole, buildingId?: string): Promise<({
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
    findOne(id: string, userId: string, userRole: UserRole): Promise<{
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
    update(id: string, updateTicketDto: UpdateTicketDto, userId: string, userRole: UserRole): Promise<{
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
    remove(id: string, userId: string, userRole: UserRole): Promise<{
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
    assignToMe(id: string, userId: string): Promise<{
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
    addPhoto(id: string, photoUrl: string, userId: string): Promise<{
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
    getStats(): Promise<{
        total: number;
        open: number;
        inProgress: number;
        resolved: number;
        resolvedPercentage: number;
    }>;
}
