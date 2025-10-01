import { KpisService } from './kpis.service';
export declare class KpisController {
    private readonly kpisService;
    constructor(kpisService: KpisService);
    getAdvancedKPIs(req: any): Promise<import("../../core/types/kpis.interface").AdvancedKPIs>;
    getBasicKPIs(req: any): Promise<{
        totalRevenue: number;
        occupancyRate: number;
        pendingRequests: number;
        collectionRate: number;
    }>;
    getFinancialKPIs(req: any): Promise<import("../../core/types/kpis.interface").FinancialKPIs>;
    getMaintenanceKPIs(req: any): Promise<import("../../core/types/kpis.interface").MaintenanceKPIs>;
    getOccupancyKPIs(req: any): Promise<import("../../core/types/kpis.interface").OccupancyKPIs>;
    getPropertyKPIs(req: any): Promise<import("../../core/types/kpis.interface").PropertyKPIs>;
    getTrends(req: any): Promise<{
        revenueTrend: import("../../core/types/kpis.interface").TrendData[];
        expenseTrend: import("../../core/types/kpis.interface").TrendData[];
        occupancyTrend: import("../../core/types/kpis.interface").TrendData[];
    }>;
}
