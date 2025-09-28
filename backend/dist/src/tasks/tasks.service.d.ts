import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UserRole } from '@prisma/client';
export declare class TasksService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createTaskDto: CreateTaskDto, userId: string): Promise<{
        building: {
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
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TaskStatus;
        buildingId: string;
        dueDate: Date | null;
        title: string;
        description: string;
        priority: import(".prisma/client").$Enums.Priority;
        photos: string[];
        assignedToId: string;
        createdById: string;
    }>;
    findAll(userId: string, userRole: UserRole): Promise<({
        building: {
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
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TaskStatus;
        buildingId: string;
        dueDate: Date | null;
        title: string;
        description: string;
        priority: import(".prisma/client").$Enums.Priority;
        photos: string[];
        assignedToId: string;
        createdById: string;
    })[]>;
    findOne(id: string, userId: string, userRole: UserRole): Promise<{
        building: {
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
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TaskStatus;
        buildingId: string;
        dueDate: Date | null;
        title: string;
        description: string;
        priority: import(".prisma/client").$Enums.Priority;
        photos: string[];
        assignedToId: string;
        createdById: string;
    }>;
    update(id: string, updateTaskDto: UpdateTaskDto, userId: string, userRole: UserRole): Promise<{
        building: {
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
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TaskStatus;
        buildingId: string;
        dueDate: Date | null;
        title: string;
        description: string;
        priority: import(".prisma/client").$Enums.Priority;
        photos: string[];
        assignedToId: string;
        createdById: string;
    }>;
    remove(id: string, userId: string, userRole: UserRole): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TaskStatus;
        buildingId: string;
        dueDate: Date | null;
        title: string;
        description: string;
        priority: import(".prisma/client").$Enums.Priority;
        photos: string[];
        assignedToId: string;
        createdById: string;
    }>;
    addPhoto(id: string, photoUrl: string, userId: string, userRole: UserRole): Promise<{
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
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TaskStatus;
        buildingId: string;
        dueDate: Date | null;
        title: string;
        description: string;
        priority: import(".prisma/client").$Enums.Priority;
        photos: string[];
        assignedToId: string;
        createdById: string;
    }>;
    completeTask(id: string, userId: string, userRole: UserRole): Promise<{
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
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TaskStatus;
        buildingId: string;
        dueDate: Date | null;
        title: string;
        description: string;
        priority: import(".prisma/client").$Enums.Priority;
        photos: string[];
        assignedToId: string;
        createdById: string;
    }>;
    private verifyTaskAccess;
}
