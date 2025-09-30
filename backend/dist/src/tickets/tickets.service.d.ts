import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { UserRole } from '@prisma/client';
export declare class TicketsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createTicketDto: CreateTicketDto & {
        tenantId: string;
    }, userId: string): Promise<{
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
    findAll(userId: string, userRole: UserRole, tenantId: string, propertyId?: string): Promise<({
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
    findOne(id: string, userId: string, userRole: UserRole, tenantId: string): Promise<{
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
    update(id: string, updateTicketDto: UpdateTicketDto, userId: string, userRole: UserRole, tenantId: string): Promise<{
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
    remove(id: string, userId: string, userRole: UserRole, tenantId: string): Promise<{
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
    assignToMe(id: string, userId: string, tenantId: string): Promise<{
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
    completeTicket(id: string, userId: string, userRole: UserRole, tenantId: string): Promise<{
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
    addPhoto(id: string, photoUrl: string, userId: string, userRole: UserRole, tenantId: string): Promise<{
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
    getStats(userId: string, userRole: UserRole, tenantId: string, propertyId?: string): Promise<{
        total: number;
        open: number;
        inProgress: number;
        resolved: number;
        resolvedPercentage: number;
    }>;
    private verifyTicketAccess;
}
