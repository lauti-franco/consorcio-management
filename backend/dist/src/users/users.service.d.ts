import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '../common/types';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(role?: UserRole, buildingId?: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        building: {
            id: string;
            name: string;
            address: string;
            city: string;
            createdAt: Date;
        };
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        updatedAt: Date;
        buildingId: string;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        building: {
            id: string;
            name: string;
            address: string;
            city: string;
            createdAt: Date;
        };
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        updatedAt: Date;
        buildingId: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        email: string;
        passwordHash: string;
        role: import(".prisma/client").$Enums.UserRole;
        updatedAt: Date;
        buildingId: string | null;
    }>;
}
