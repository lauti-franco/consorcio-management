import { PrismaService } from '../prisma/prisma.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
export declare class UnitsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createUnitDto: CreateUnitDto & {
        tenantId: string;
    }, userId: string): Promise<{
        property: {
            id: string;
            name: string;
            address: string;
        };
        manager: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        number: string;
        id: string;
        tenantId: string;
        features: string[];
        floor: number;
        type: import(".prisma/client").$Enums.UnitType;
        area: number | null;
        bedrooms: number | null;
        bathrooms: number | null;
        isOccupied: boolean;
        propertyId: string;
        managerId: string | null;
    }>;
    findAll(propertyId: string, userId: string, tenantId: string): Promise<({
        property: {
            id: string;
            name: string;
            address: string;
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
        tenantId: string;
        features: string[];
        floor: number;
        type: import(".prisma/client").$Enums.UnitType;
        area: number | null;
        bedrooms: number | null;
        bathrooms: number | null;
        isOccupied: boolean;
        propertyId: string;
        managerId: string | null;
    })[]>;
    findOne(id: string, userId: string, tenantId: string): Promise<{
        expenses: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string | null;
            tenantId: string;
            status: import(".prisma/client").$Enums.ExpenseStatus;
            type: import(".prisma/client").$Enums.ExpenseType;
            propertyId: string;
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
                userId: string | null;
                tenantId: string;
                status: import(".prisma/client").$Enums.ExpenseStatus;
                type: import(".prisma/client").$Enums.ExpenseType;
                propertyId: string;
                concept: string;
                amount: number;
                dueDate: Date;
                period: string | null;
                unitId: string | null;
            };
        } & {
            id: string;
            userId: string;
            tenantId: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
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
            description: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            tenantId: string;
            status: import(".prisma/client").$Enums.TicketStatus;
            propertyId: string;
            unitId: string | null;
            title: string;
            priority: import(".prisma/client").$Enums.Priority;
            category: string;
            photos: string[];
            assignedToId: string | null;
        }[];
        property: {
            id: string;
            name: string;
            address: string;
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
        tenantId: string;
        features: string[];
        floor: number;
        type: import(".prisma/client").$Enums.UnitType;
        area: number | null;
        bedrooms: number | null;
        bathrooms: number | null;
        isOccupied: boolean;
        propertyId: string;
        managerId: string | null;
    }>;
    update(id: string, updateUnitDto: UpdateUnitDto, userId: string, tenantId: string): Promise<{
        property: {
            id: string;
            name: string;
            address: string;
        };
        manager: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        number: string;
        id: string;
        tenantId: string;
        features: string[];
        floor: number;
        type: import(".prisma/client").$Enums.UnitType;
        area: number | null;
        bedrooms: number | null;
        bathrooms: number | null;
        isOccupied: boolean;
        propertyId: string;
        managerId: string | null;
    }>;
    remove(id: string, userId: string, tenantId: string): Promise<{
        number: string;
        id: string;
        tenantId: string;
        features: string[];
        floor: number;
        type: import(".prisma/client").$Enums.UnitType;
        area: number | null;
        bedrooms: number | null;
        bathrooms: number | null;
        isOccupied: boolean;
        propertyId: string;
        managerId: string | null;
    }>;
    getUnitStats(id: string, userId: string, tenantId: string): Promise<{
        totalDue: number;
        activeTickets: number;
        paymentHistory: {
            id: string;
            userId: string;
            tenantId: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
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
                userId: string;
                tenantId: string;
                status: import(".prisma/client").$Enums.PaymentStatus;
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
            userId: string | null;
            tenantId: string;
            status: import(".prisma/client").$Enums.ExpenseStatus;
            type: import(".prisma/client").$Enums.ExpenseType;
            propertyId: string;
            concept: string;
            amount: number;
            dueDate: Date;
            period: string | null;
            unitId: string | null;
        }[];
    }>;
    private verifyUnitAccess;
}
