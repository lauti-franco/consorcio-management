import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    create(createTaskDto: CreateTaskDto, req: any): Promise<{
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
    findAll(req: any): Promise<({
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
    findOne(id: string, req: any): Promise<{
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
    update(id: string, updateTaskDto: UpdateTaskDto, req: any): Promise<{
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
    remove(id: string, req: any): Promise<{
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
    addPhoto(id: string, photoUrl: string, req: any): Promise<{
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
    completeTask(id: string, req: any): Promise<{
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
}
