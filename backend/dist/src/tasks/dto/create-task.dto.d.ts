import { Priority, TaskStatus } from '@prisma/client';
export declare class CreateTaskDto {
    title: string;
    description: string;
    assignedTo: string;
    buildingId: string;
    priority?: Priority;
    status?: TaskStatus;
    dueDate?: string;
    photos?: string[];
}
