import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    create(createTaskDto: CreateTaskDto, req: any): Promise<{
        assignedUser: {
            id: string;
            name: string;
            email: string;
        };
        createdUser: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        dueDate: Date | null;
        status: import(".prisma/client").$Enums.TaskStatus;
        title: string;
        description: string;
        photos: string[];
        assignedTo: string;
        createdBy: string;
    }>;
    findAll(req: any): Promise<({
        assignedUser: {
            id: string;
            name: string;
            email: string;
        };
        createdUser: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        dueDate: Date | null;
        status: import(".prisma/client").$Enums.TaskStatus;
        title: string;
        description: string;
        photos: string[];
        assignedTo: string;
        createdBy: string;
    })[]>;
    findOne(id: string, req: any): Promise<{
        assignedUser: {
            id: string;
            name: string;
            email: string;
        };
        createdUser: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        dueDate: Date | null;
        status: import(".prisma/client").$Enums.TaskStatus;
        title: string;
        description: string;
        photos: string[];
        assignedTo: string;
        createdBy: string;
    }>;
    update(id: string, updateTaskDto: UpdateTaskDto, req: any): Promise<{
        assignedUser: {
            id: string;
            name: string;
            email: string;
        };
        createdUser: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        dueDate: Date | null;
        status: import(".prisma/client").$Enums.TaskStatus;
        title: string;
        description: string;
        photos: string[];
        assignedTo: string;
        createdBy: string;
    }>;
    remove(id: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        dueDate: Date | null;
        status: import(".prisma/client").$Enums.TaskStatus;
        title: string;
        description: string;
        photos: string[];
        assignedTo: string;
        createdBy: string;
    }>;
    addPhoto(id: string, photoUrl: string, req: any): Promise<{
        assignedUser: {
            id: string;
            name: string;
            email: string;
        };
        createdUser: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        dueDate: Date | null;
        status: import(".prisma/client").$Enums.TaskStatus;
        title: string;
        description: string;
        photos: string[];
        assignedTo: string;
        createdBy: string;
    }>;
}
