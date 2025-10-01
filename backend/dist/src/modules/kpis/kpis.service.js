"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KpisService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../shared/database/prisma.service");
let KpisService = class KpisService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAdvancedKPIs(tenantId) {
        const financialData = {
            totalRevenue: 150000,
            pendingPayments: 25000,
            collectionRate: 85,
            averagePaymentTime: 7,
            currentRevenue: 150000,
            previousRevenue: 135000,
        };
        const maintenanceData = {
            pendingRequests: 12,
            avgResolutionTime: 3.5,
            preventiveMaintenance: 8,
            urgentIssues: 2,
            totalTickets: 45,
            resolvedTickets: 33,
        };
        const occupancyData = {
            occupancyRate: 95,
            vacantUnits: 3,
            tenantSatisfaction: 4.2,
            newContracts: 5,
            totalUnits: 60,
            occupiedUnits: 57,
        };
        const propertyData = {
            buildingValue: 2500000,
            maintenanceCost: 125000,
            energyConsumption: 45000,
            waterConsumption: 18000,
            propertyValue: 2500000,
            maintenanceCostPerUnit: 1250,
            revenuePerUnit: 4500,
            expenseRatio: 0.28,
        };
        const trends = {
            revenueTrend: [
                { period: 'Ene', value: 45000, comparison: 42000 },
                { period: 'Feb', value: 52000, comparison: 45000 },
                { period: 'Mar', value: 48000, comparison: 52000 },
            ],
            expenseTrend: [
                { period: 'Ene', value: 28000, comparison: 26000 },
                { period: 'Feb', value: 32000, comparison: 28000 },
                { period: 'Mar', value: 30000, comparison: 32000 },
            ],
            occupancyTrend: [
                { period: 'Ene', value: 92, comparison: 90 },
                { period: 'Feb', value: 95, comparison: 92 },
                { period: 'Mar', value: 93, comparison: 95 },
            ],
        };
        return {
            financial: financialData,
            maintenance: maintenanceData,
            occupancy: occupancyData,
            property: propertyData,
            trends: trends,
        };
    }
    async getBasicKPIs(tenantId) {
        const advancedKPIs = await this.getAdvancedKPIs(tenantId);
        return {
            totalRevenue: advancedKPIs.financial.totalRevenue,
            occupancyRate: advancedKPIs.occupancy.occupancyRate,
            pendingRequests: advancedKPIs.maintenance.pendingRequests,
            collectionRate: advancedKPIs.financial.collectionRate,
        };
    }
    async getFinancialData(tenantId) {
        const advancedKPIs = await this.getAdvancedKPIs(tenantId);
        return advancedKPIs.financial;
    }
    async getMaintenanceData(tenantId) {
        const advancedKPIs = await this.getAdvancedKPIs(tenantId);
        return advancedKPIs.maintenance;
    }
    async getOccupancyData(tenantId) {
        const advancedKPIs = await this.getAdvancedKPIs(tenantId);
        return advancedKPIs.occupancy;
    }
    async getPropertyData(tenantId) {
        const advancedKPIs = await this.getAdvancedKPIs(tenantId);
        return advancedKPIs.property;
    }
    async getTrendsData(tenantId) {
        const advancedKPIs = await this.getAdvancedKPIs(tenantId);
        return advancedKPIs.trends;
    }
};
exports.KpisService = KpisService;
exports.KpisService = KpisService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], KpisService);
//# sourceMappingURL=kpis.service.js.map