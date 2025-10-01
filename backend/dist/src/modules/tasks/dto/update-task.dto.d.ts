import { CreateTaskDto } from './create-task.dto';
import { TaskStatus, Priority } from '@prisma/client';
declare const UpdateTaskDto_base: import("@nestjs/common").Type<Partial<CreateTaskDto>>;
export declare class UpdateTaskDto extends UpdateTaskDto_base {
    status?: TaskStatus;
    priority?: Priority;
    assignedTo?: string;
    dueDate?: string;
    photos?: string[];
}
export {};
