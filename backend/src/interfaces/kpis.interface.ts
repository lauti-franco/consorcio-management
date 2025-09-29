// src/kpis/interfaces/kpis.interface.ts
export interface FinancialKPIs {
  currentRevenue: number;
  previousRevenue: number;
  revenueGrowth: number;
  currentExpenses: number;
  previousExpenses: number;
  expenseGrowth: number;
  netProfit: number;
  profitMargin: number;
  collectionRate: number;
  delinquencyRate: number;
}

export interface MaintenanceKPIs {
  totalTickets: number;
  resolvedTickets: number;
  resolutionRate: number;
  avgResolutionTime: number;
  maintenanceCosts: number;
  preventiveMaintenanceRate: number;
}

export interface OccupancyKPIs {
  totalUnits: number;
  occupiedUnits: number;
  occupancyRate: number;
  vacancyRate: number;
  averageTenancyDuration: number;
  turnoverRate: number;
}

export interface PropertyKPIs {
  propertyValue: number;
  maintenanceCostPerUnit: number;
  revenuePerUnit: number;
  expenseRatio: number;
}

export interface TrendData {
  period: string;
  value: number;
  comparison?: number;
}

export interface AdvancedKPIs {
  financial: FinancialKPIs;
  maintenance: MaintenanceKPIs;
  occupancy: OccupancyKPIs;
  properties: PropertyKPIs[];
  trends: {
    revenueTrend: TrendData[];
    expenseTrend: TrendData[];
    occupancyTrend: TrendData[];
  };
}