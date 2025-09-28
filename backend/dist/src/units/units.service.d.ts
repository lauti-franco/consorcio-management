import { PrismaService } from '../prisma/prisma.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
export declare class UnitsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createUnitDto: CreateUnitDto, userId: string): Promise<{
        building: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            address: string;
            city: string;
            settings: import("@prisma/client/runtime/library").JsonValue;
            ownerId: string;
        };
        manager: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        number: string;
        id: string;
        features: string[];
        floor: number;
        type: import(".prisma/client").$Enums.UnitType;
        area: number;
        bedrooms: number | null;
        bathrooms: number | null;
        isOccupied: boolean;
        buildingId: string;
        managerId: string | null;
    }>;
    findAll(buildingId: string, userId: string): Promise<({
        building: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            address: string;
            city: string;
            settings: import("@prisma/client/runtime/library").JsonValue;
            ownerId: string;
        };
        manager: {
            id: string;
            name: string;
            email: string;
        };
        _count: {
            expenses: number;
            payments: number;
            tickets: number;
        };
    } & {
        number: string;
        id: string;
        features: string[];
        floor: number;
        type: import(".prisma/client").$Enums.UnitType;
        area: number;
        bedrooms: number | null;
        bathrooms: number | null;
        isOccupied: boolean;
        buildingId: string;
        managerId: string | null;
    })[]>;
    findOne(id: string, userId: string): Promise<{
        expenses: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.ExpenseStatus;
            userId: string | null;
            type: import(".prisma/client").$Enums.ExpenseType;
            buildingId: string;
            concept: string;
            amount: number;
            dueDate: Date;
            period: string | null;
            unitId: string | null;
        }[];
        payments: ({
            user: {
                id: string;
                name: string;
                email: string;
            };
            expense: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: import(".prisma/client").$Enums.ExpenseStatus;
                userId: string | null;
                type: import(".prisma/client").$Enums.ExpenseType;
                buildingId: string;
                concept: string;
                amount: number;
                dueDate: Date;
                period: string | null;
                unitId: string | null;
            };
        } & {
            id: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
            userId: string;
            amount: number;
            unitId: string;
            date: Date;
            method: import(".prisma/client").$Enums.PaymentMethod;
            transactionId: string | null;
            receiptUrl: string | null;
            expenseId: string;
        })[];
        tickets: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.TicketStatus;
            userId: string;
            buildingId: string;
            unitId: string | null;
            title: string;
            description: string;
            priority: import(".prisma/client").$Enums.Priority;
            category: string;
            photos: string[];
            assignedToId: string | null;
        }[];
        building: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            address: string;
            city: string;
            settings: import("@prisma/client/runtime/library").JsonValue;
            ownerId: string;
        };
        manager: {
            id: string;
            name: string;
            email: string;
            phone: string;
        };
    } & {
        number: string;
        id: string;
        features: string[];
        floor: number;
        type: import(".prisma/client").$Enums.UnitType;
        area: number;
        bedrooms: number | null;
        bathrooms: number | null;
        isOccupied: boolean;
        buildingId: string;
        managerId: string | null;
    }>;
    update(id: string, updateUnitDto: UpdateUnitDto, userId: string): Promise<{
        building: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            address: string;
            city: string;
            settings: import("@prisma/client/runtime/library").JsonValue;
            ownerId: string;
        };
        manager: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        number: string;
        id: string;
        features: string[];
        floor: number;
        type: import(".prisma/client").$Enums.UnitType;
        area: number;
        bedrooms: number | null;
        bathrooms: number | null;
        isOccupied: boolean;
        buildingId: string;
        managerId: string | null;
    }>;
    remove(id: string, userId: string): Promise<{
        number: string;
        id: string;
        features: string[];
        floor: number;
        type: import(".prisma/client").$Enums.UnitType;
        area: number;
        bedrooms: number | null;
        bathrooms: number | null;
        isOccupied: boolean;
        buildingId: string;
        managerId: string | null;
    }>;
    getUnitStats(id: string, userId: string): Promise<{
        totalDue: number;
        activeTickets: number;
        paymentHistory: {
            id: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
            userId: string;
            amount: number;
            unitId: string;
            date: Date;
            method: import(".prisma/client").$Enums.PaymentMethod;
            transactionId: string | null;
            receiptUrl: string | null;
            expenseId: string;
        }[];
        currentExpenses: {
            paidAmount: number;
            remaining: number;
            payments: {
                id: string;
                status: import(".prisma/client").$Enums.PaymentStatus;
                userId: string;
                amount: number;
                unitId: string;
                date: Date;
                method: import(".prisma/client").$Enums.PaymentMethod;
                transactionId: string | null;
                receiptUrl: string | null;
                expenseId: string;
            }[];
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.ExpenseStatus;
            userId: string | null;
            type: import(".prisma/client").$Enums.ExpenseType;
            buildingId: string;
            concept: string;
            amount: number;
            dueDate: Date;
            period: string | null;
            unitId: string | null;
        }[];
    }>;
    private verifyUnitAccess;
}
