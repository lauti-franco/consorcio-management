import { Request } from 'express';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    create(createTaskDto: CreateTaskDto, req: Request): Promise<{
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
    findAll(req: Request): Promise<({
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
    findOne(id: string, req: Request): Promise<{
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
    update(id: string, updateTaskDto: UpdateTaskDto, req: Request): Promise<{
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
    remove(id: string, req: Request): Promise<{
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
    addPhoto(id: string, photoUrl: string, req: Request): Promise<{
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
    completeTask(id: string, req: Request): Promise<{
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
}
