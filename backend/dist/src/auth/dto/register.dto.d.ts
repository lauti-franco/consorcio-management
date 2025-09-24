import { UserRole } from '../../common/types';
export declare class RegisterDto {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    buildingId?: string;
}
