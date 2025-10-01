export declare class DashboardStatsDto {
    totalBuildings: number;
    totalUnits: number;
    totalResidents: number;
    activeTickets: number;
    pendingExpenses: number;
    monthlyRevenue: number;
    collectionRate: number;
}
export declare class ExpenseTrendDto {
    period: string;
    total: number;
    collected: number;
}
export declare class RecentActivityDto {
    type: string;
    description: string;
    date: Date;
    buildingName?: string;
}
