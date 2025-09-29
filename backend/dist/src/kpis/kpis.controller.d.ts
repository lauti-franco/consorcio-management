import { KpisService } from './kpis.service';
export declare class KpisController {
    private readonly kpisService;
    constructor(kpisService: KpisService);
    getAdvancedKPIs(req: any, period?: string): Promise<import("../interfaces/kpis.interface").AdvancedKPIs>;
    getFinancialKPIs(req: any, period?: string): Promise<import("../interfaces/kpis.interface").FinancialKPIs>;
    getMaintenanceKPIs(req: any, period?: string): Promise<import("../interfaces/kpis.interface").MaintenanceKPIs>;
}
