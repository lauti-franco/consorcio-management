import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UserRole } from '@prisma/client';
export declare class TasksService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createTaskDto: CreateTaskDto & {
        tenantId: string;
    }, userId: string): Promise<{
        property: {
            id: string;
            name: string;
        };
        assignedTo: {
            id: string;
            name: string;
            email: string;
        };
        createdBy: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        propertyId: string;
        dueDate: Date | null;
        title: string;
        priority: import(".prisma/client").$Enums.Priority;
        photos: string[];
        assignedToId: string;
        createdById: string;
    }>;
    findAll(userId: string, userRole: UserRole, tenantId: string): Promise<({
        property: {
            id: string;
            name: string;
        };
        assignedTo: {
            id: string;
            name: string;
            email: string;
            phone: string;
        };
        createdBy: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        propertyId: string;
        dueDate: Date | null;
        title: string;
        priority: import(".prisma/client").$Enums.Priority;
        photos: string[];
        assignedToId: string;
        createdById: string;
    })[]>;
    findOne(id: string, userId: string, userRole: UserRole, tenantId: string): Promise<{
        property: {
            id: string;
            name: string;
            address: string;
        };
        assignedTo: {
            id: string;
            name: string;
            email: string;
            phone: string;
        };
        createdBy: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        propertyId: string;
        dueDate: Date | null;
        title: string;
        priority: import(".prisma/client").$Enums.Priority;
        photos: string[];
        assignedToId: string;
        createdById: string;
    }>;
    update(id: string, updateTaskDto: UpdateTaskDto, userId: string, userRole: UserRole, tenantId: string): Promise<{
        property: {
            id: string;
            name: string;
        };
        assignedTo: {
            id: string;
            name: string;
            email: string;
        };
        createdBy: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        propertyId: string;
        dueDate: Date | null;
        title: string;
        priority: import(".prisma/client").$Enums.Priority;
        photos: string[];
        assignedToId: string;
        createdById: string;
    }>;
    remove(id: string, userId: string, userRole: UserRole, tenantId: string): Promise<{
        id: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        propertyId: string;
        dueDate: Date | null;
        title: string;
        priority: import(".prisma/client").$Enums.Priority;
        photos: string[];
        assignedToId: string;
        createdById: string;
    }>;
    addPhoto(id: string, photoUrl: string, userId: string, userRole: UserRole, tenantId: string): Promise<{
        assignedTo: {
            id: string;
            name: string;
            email: string;
        };
        createdBy: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        propertyId: string;
        dueDate: Date | null;
        title: string;
        priority: import(".prisma/client").$Enums.Priority;
        photos: string[];
        assignedToId: string;
        createdById: string;
    }>;
    completeTask(id: string, userId: string, userRole: UserRole, tenantId: string): Promise<{
        assignedTo: {
            id: string;
            name: string;
            email: string;
        };
        createdBy: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        propertyId: string;
        dueDate: Date | null;
        title: string;
        priority: import(".prisma/client").$Enums.Priority;
        photos: string[];
        assignedToId: string;
        createdById: string;
    }>;
    private verifyTaskAccess;
}
