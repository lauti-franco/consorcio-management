import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UserRole } from '../common/types';
export declare class TasksService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createTaskDto: CreateTaskDto, userId: string): Promise<{
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
    findAll(userId: string, userRole: UserRole): Promise<({
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
    findOne(id: string, userId: string, userRole: UserRole): Promise<{
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
    update(id: string, updateTaskDto: UpdateTaskDto, userId: string, userRole: UserRole): Promise<{
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
    remove(id: string, userId: string): Promise<{
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
    addPhoto(id: string, photoUrl: string, userId: string): Promise<{
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
