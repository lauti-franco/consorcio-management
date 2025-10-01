import { PrismaService } from '../../shared/database/prisma.service';
import { AdvancedKPIs, FinancialKPIs, MaintenanceKPIs, OccupancyKPIs, PropertyKPIs, TrendData } from '../../core/types/kpis.interface';
export declare class KpisService {
    private prisma;
    constructor(prisma: PrismaService);
    getAdvancedKPIs(tenantId: string): Promise<AdvancedKPIs>;
    getBasicKPIs(tenantId: string): Promise<{
        totalRevenue: number;
        occupancyRate: number;
        pendingRequests: number;
        collectionRate: number;
    }>;
    getFinancialData(tenantId: string): Promise<FinancialKPIs>;
    getMaintenanceData(tenantId: string): Promise<MaintenanceKPIs>;
    getOccupancyData(tenantId: string): Promise<OccupancyKPIs>;
    getPropertyData(tenantId: string): Promise<PropertyKPIs>;
    getTrendsData(tenantId: string): Promise<{
        revenueTrend: TrendData[];
        expenseTrend: TrendData[];
        occupancyTrend: TrendData[];
    }>;
}
