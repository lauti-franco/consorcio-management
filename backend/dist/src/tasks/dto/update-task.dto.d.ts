import { CreateTaskDto } from './create-task.dto';
import { TaskStatus } from '../../common/types';
declare const UpdateTaskDto_base: import("@nestjs/common").Type<Partial<CreateTaskDto>>;
export declare class UpdateTaskDto extends UpdateTaskDto_base {
    status?: TaskStatus;
}
export {};
