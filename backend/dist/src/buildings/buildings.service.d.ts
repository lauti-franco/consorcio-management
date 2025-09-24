import { PrismaService } from '../prisma/prisma.service';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';
export declare class BuildingsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createBuildingDto: CreateBuildingDto): Promise<{
        id: string;
        name: string;
        address: string;
        city: string;
        createdAt: Date;
    }>;
    findAll(): Promise<({
        users: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
        }[];
        expenses: {
            id: string;
            createdAt: Date;
            buildingId: string;
            concept: string;
            amount: number;
            dueDate: Date;
            status: import(".prisma/client").$Enums.ExpenseStatus;
            userId: string | null;
        }[];
    } & {
        id: string;
        name: string;
        address: string;
        city: string;
        createdAt: Date;
    })[]>;
    findOne(id: string): Promise<{
        users: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
        }[];
        expenses: ({
            payments: {
                id: string;
                amount: number;
                userId: string;
                date: Date;
                method: string;
                receiptUrl: string | null;
                expenseId: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            buildingId: string;
            concept: string;
            amount: number;
            dueDate: Date;
            status: import(".prisma/client").$Enums.ExpenseStatus;
            userId: string | null;
        })[];
    } & {
        id: string;
        name: string;
        address: string;
        city: string;
        createdAt: Date;
    }>;
    update(id: string, updateBuildingDto: UpdateBuildingDto): Promise<{
        id: string;
        name: string;
        address: string;
        city: string;
        createdAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        address: string;
        city: string;
        createdAt: Date;
    }>;
}
