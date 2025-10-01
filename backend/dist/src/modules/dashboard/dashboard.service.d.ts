import { PrismaService } from '../../shared/database/prisma.service';
import { UserRole } from '@prisma/client';
export interface AdminDashboard {
    overview: {
        totalProperties: number;
        totalUnits: number;
        totalResidents: number;
        activeTickets: number;
        pendingExpenses: number;
        monthlyRevenue: number;
        collectionRate: number;
        occupancyRate: number;
    };
    properties: PropertyStats;
    expenseTrends: ExpenseTrend[];
    recentActivities: RecentActivity[];
    delinquency: DelinquencyStats;
    quickStats: QuickStats;
}
export interface ResidentDashboard {
    user: {
        name: string;
        email: string;
        role: UserRole;
    };
    overview: {
        totalDue: number;
        activeTickets: number;
        managedUnits: number;
        nextDueDate?: Date;
    };
    recentExpenses: ResidentExpense[];
    recentTickets: ResidentTicket[];
    paymentHistory: PaymentHistory[];
    financialSummary: FinancialSummary;
}
export interface MaintenanceDashboard {
    overview: {
        assignedTickets: number;
        completedThisMonth: number;
        activeProperties: number;
        averageResolutionTime: number;
    };
    assignedTickets: MaintenanceTicket[];
    properties: MaintenanceProperty[];
    priorityBreakdown: PriorityBreakdown;
    performanceMetrics: PerformanceMetrics;
}
interface PropertyStats {
    total: number;
    active: number;
    occupancyRate: number;
}
interface ExpenseTrend {
    period: string;
    total: number;
    collected: number;
    pending: number;
}
interface RecentActivity {
    type: 'PAYMENT' | 'TICKET' | 'EXPENSE' | 'TASK';
    description: string;
    date: Date;
    propertyName: string;
    amount?: number;
}
interface DelinquencyStats {
    overdueExpenses: number;
    totalOverdueAmount: number;
    delinquencyRate: number;
    topDelinquentUnits: DelinquentUnit[];
}
interface QuickStats {
    pendingTasks: number;
    openTickets: number;
    scheduledTasks: number;
    overdueExpenses: number;
}
interface ResidentExpense {
    id: string;
    concept: string;
    amount: number;
    dueDate: Date;
    status: string;
    property: string;
    unit: string;
    paidAmount: number;
    remainingAmount: number;
}
interface ResidentTicket {
    id: string;
    title: string;
    status: string;
    priority: string;
    createdAt: Date;
    property: string;
    unit: string;
}
interface PaymentHistory {
    id: string;
    date: Date;
    amount: number;
    concept: string;
    method: string;
    status: string;
}
interface FinancialSummary {
    totalPaid: number;
    pendingAmount: number;
    upcomingExpenses: number;
}
interface MaintenanceTicket {
    id: string;
    title: string;
    status: string;
    priority: string;
    createdAt: Date;
    property: {
        id: string;
        name: string;
    };
    unit: {
        id: string;
        number: string;
    };
    user: {
        name: string;
        phone: string;
    };
}
interface MaintenanceProperty {
    id: string;
    name: string;
    activeTickets: number;
}
interface PriorityBreakdown {
    high: number;
    medium: number;
    low: number;
}
interface PerformanceMetrics {
    resolutionRate: number;
    averageResponseTime: number;
    customerSatisfaction: number;
}
interface DelinquentUnit {
    unitNumber: string;
    propertyName: string;
    overdueAmount: number;
    daysOverdue: number;
}
export declare class DashboardService {
    private prisma;
    constructor(prisma: PrismaService);
    getDashboardByRole(userId: string, tenantId: string, userRole: UserRole): Promise<AdminDashboard | ResidentDashboard | MaintenanceDashboard>;
    getAdminDashboard(userId: string, tenantId: string): Promise<AdminDashboard>;
    getResidentDashboard(userId: string, tenantId: string): Promise<ResidentDashboard>;
    getMaintenanceDashboard(userId: string, tenantId: string): Promise<MaintenanceDashboard>;
    private getPropertyStats;
    private getUnitStats;
    private getResidentStats;
    private getActiveTickets;
    private getPendingExpenses;
    private getMonthlyRevenue;
    private calculateCollectionRate;
    private getExpenseTrends;
    private getRecentActivities;
    private getDelinquencyStats;
    private getQuickStats;
    private getResidentUserData;
    private getPaymentHistory;
    private getFinancialSummary;
    private getNextDueDate;
    private getAssignedTickets;
    private getCompletedTicketsCount;
    private getMaintenanceProperties;
    private getPriorityBreakdown;
    private getPerformanceMetrics;
    getAdvancedKPIs(userId: string, tenantId: string): Promise<{
        financialHealth: {
            currentRevenue: number;
            revenueGrowth: number;
            currentExpenses: number;
            expenseGrowth: number;
            netProfit: number;
            profitMargin: number;
        };
        maintenanceMetrics: {
            totalTickets: number;
            resolvedTickets: number;
            resolutionRate: number;
            avgResolutionTime: number;
        };
        occupancyData: {
            totalUnits: number;
            occupiedUnits: number;
            occupancyRate: number;
            vacancyRate: number;
        };
        collectionPerformance: {
            totalDue: number;
            totalCollected: number;
            collectionRate: number;
            overdueAmount: number;
            delinquencyRate: number;
        };
    }>;
    private getFinancialHealth;
    private getMonthlyRevenueForPeriod;
    private getMonthlyExpensesForPeriod;
    private getMaintenanceMetrics;
    private getAverageResolutionTime;
    private getOccupancyData;
    private getCollectionPerformance;
}
export {};
