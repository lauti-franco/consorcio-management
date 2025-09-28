import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { UserRole } from '@prisma/client';
export declare class TicketsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createTicketDto: CreateTicketDto, userId: string): Promise<{
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
    findAll(userId: string, userRole: UserRole, buildingId?: string): Promise<({
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
    findOne(id: string, userId: string, userRole: UserRole): Promise<{
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
    update(id: string, updateTicketDto: UpdateTicketDto, userId: string, userRole: UserRole): Promise<{
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
    remove(id: string, userId: string, userRole: UserRole): Promise<{
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
    assignToMe(id: string, userId: string): Promise<{
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
    completeTicket(id: string, userId: string, userRole: UserRole): Promise<{
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
    addPhoto(id: string, photoUrl: string, userId: string, userRole: UserRole): Promise<{
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
    getStats(userId: string, userRole: UserRole, buildingId?: string): Promise<{
        total: number;
        open: number;
        inProgress: number;
        resolved: number;
        resolvedPercentage: number;
    }>;
    private verifyTicketAccess;
}
