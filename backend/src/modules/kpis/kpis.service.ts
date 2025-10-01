import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import {
  AdvancedKPIs,
  FinancialKPIs,
  MaintenanceKPIs,
  OccupancyKPIs,
  PropertyKPIs,
  TrendData,
} from '../../core/types/kpis.interface';

@Injectable()
export class KpisService {
  constructor(private prisma: PrismaService) {}

  async getAdvancedKPIs(tenantId: string): Promise<AdvancedKPIs> {
    // Datos de ejemplo - reemplazar con consultas reales a la base de datos
    const financialData: FinancialKPIs = {
      totalRevenue: 150000,
      pendingPayments: 25000,
      collectionRate: 85,
      averagePaymentTime: 7,
      currentRevenue: 150000,
      previousRevenue: 135000,
    };

    const maintenanceData: MaintenanceKPIs = {
      pendingRequests: 12,
      avgResolutionTime: 3.5,
      preventiveMaintenance: 8,
      urgentIssues: 2,
      totalTickets: 45,
      resolvedTickets: 33,
    };

    const occupancyData: OccupancyKPIs = {
      occupancyRate: 95,
      vacantUnits: 3,
      tenantSatisfaction: 4.2,
      newContracts: 5,
      totalUnits: 60,
      occupiedUnits: 57,
    };

    const propertyData: PropertyKPIs = {
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

  async getBasicKPIs(tenantId: string) {
    const advancedKPIs = await this.getAdvancedKPIs(tenantId);
    
    return {
      totalRevenue: advancedKPIs.financial.totalRevenue,
      occupancyRate: advancedKPIs.occupancy.occupancyRate,
      pendingRequests: advancedKPIs.maintenance.pendingRequests,
      collectionRate: advancedKPIs.financial.collectionRate,
    };
  }

  // Método para obtener solo datos financieros
  async getFinancialData(tenantId: string): Promise<FinancialKPIs> {
    const advancedKPIs = await this.getAdvancedKPIs(tenantId);
    return advancedKPIs.financial;
  }

  // Método para obtener solo datos de mantenimiento
  async getMaintenanceData(tenantId: string): Promise<MaintenanceKPIs> {
    const advancedKPIs = await this.getAdvancedKPIs(tenantId);
    return advancedKPIs.maintenance;
  }

  // Método para obtener solo datos de ocupación
  async getOccupancyData(tenantId: string): Promise<OccupancyKPIs> {
    const advancedKPIs = await this.getAdvancedKPIs(tenantId);
    return advancedKPIs.occupancy;
  }

  // Método para obtener solo datos de propiedad
  async getPropertyData(tenantId: string): Promise<PropertyKPIs> {
    const advancedKPIs = await this.getAdvancedKPIs(tenantId);
    return advancedKPIs.property;
  }

  // Método para obtener solo tendencias
  async getTrendsData(tenantId: string) {
    const advancedKPIs = await this.getAdvancedKPIs(tenantId);
    return advancedKPIs.trends;
  }
}
