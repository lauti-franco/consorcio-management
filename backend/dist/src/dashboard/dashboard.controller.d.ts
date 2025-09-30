import { Request } from 'express';
import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    private getUserId;
    private getTenantId;
    private getUserRole;
    getAdminDashboard(req: Request): Promise<import("./dashboard.service").AdminDashboard>;
    getResidentDashboard(req: Request): Promise<import("./dashboard.service").ResidentDashboard>;
    getMaintenanceDashboard(req: Request): Promise<import("./dashboard.service").MaintenanceDashboard>;
    getDashboard(req: Request): Promise<import("./dashboard.service").AdminDashboard | import("./dashboard.service").ResidentDashboard | import("./dashboard.service").MaintenanceDashboard>;
}
