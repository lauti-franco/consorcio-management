import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getAdminDashboard(user: any): Promise<{
        overview: {
            totalBuildings: number;
            totalUnits: number;
            totalResidents: number;
            activeTickets: number;
            pendingExpenses: number;
            monthlyRevenue: number;
            collectionRate: number;
        };
        buildings: {
            total: number;
            active: number;
        };
        expenseTrends: {
            period: string;
            total: any;
            collected: any;
        }[];
        recentActivities: {
            type: string;
            description: string;
            date: Date;
            buildingName: string;
        }[];
    }>;
    getResidentDashboard(user: any): Promise<{
        user: {
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
        overview: {
            totalDue: number;
            activeTickets: number;
            managedUnits: number;
        };
        recentExpenses: {
            building: string;
            unit: string;
            paidAmount: number;
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
        recentTickets: {
            building: string;
            unit: string;
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
    }>;
    getMaintenanceDashboard(user: any): Promise<{
        overview: {
            assignedTickets: number;
            completedThisMonth: number;
            activeBuildings: number;
        };
        assignedTickets: ({
            user: {
                name: string;
                phone: string;
            };
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
            unit: {
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
            };
        } & {
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
        })[];
        buildings: {
            id: string;
            name: string;
            _count: {
                tickets: number;
            };
        }[];
    }>;
}
