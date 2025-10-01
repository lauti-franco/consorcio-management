export interface KpiData {
  id: string;
  name: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  target: number;
}

export interface TrendData {
  period: string;
  value: number;
  comparison: number;
}

export interface FinancialKPIs {
  totalRevenue: number;
  pendingPayments: number;
  collectionRate: number;
  averagePaymentTime: number;
  currentRevenue?: number;
  previousRevenue?: number;
}

export interface MaintenanceKPIs {
  pendingRequests: number;
  avgResolutionTime: number;
  preventiveMaintenance: number;
  urgentIssues: number;
  totalTickets?: number;
  resolvedTickets?: number;
}

export interface OccupancyKPIs {
  occupancyRate: number;
  vacantUnits: number;
  tenantSatisfaction: number;
  newContracts: number;
  totalUnits?: number;
  occupiedUnits?: number;
}

export interface PropertyKPIs {
  buildingValue: number;
  maintenanceCost: number;
  energyConsumption: number;
  waterConsumption: number;
  propertyValue?: number;
  maintenanceCostPerUnit?: number;
  revenuePerUnit?: number;
  expenseRatio?: number;
}

export interface AdvancedKPIs {
  financial: FinancialKPIs;
  maintenance: MaintenanceKPIs;
  occupancy: OccupancyKPIs;
  property: PropertyKPIs;
  trends: {
    revenueTrend: TrendData[];
    expenseTrend: TrendData[];
    occupancyTrend: TrendData[];
  };
}
