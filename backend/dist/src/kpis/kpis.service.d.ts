import { PrismaService } from '../prisma/prisma.service';
import { AdvancedKPIs } from '../interfaces/kpis.interface';
export declare class KpisService {
    private prisma;
    constructor(prisma: PrismaService);
    getAdvancedKPIs(tenantId: string, userId: string, period?: string): Promise<AdvancedKPIs>;
    private getFinancialKPIs;
    private getMaintenanceKPIs;
    private getOccupancyKPIs;
    private getPropertiesKPIs;
    private getTrends;
    private getFinancialDataForPeriod;
    private getCollectionData;
    private getDateFilter;
    private getPreviousPeriodDate;
    private getPeriodStartDate;
    private getPeriodEndDate;
    private getAverageResolutionTime;
}
