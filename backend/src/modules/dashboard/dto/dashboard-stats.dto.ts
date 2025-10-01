import { ApiProperty } from '@nestjs/swagger';

export class DashboardStatsDto {
  @ApiProperty()
  totalBuildings: number;

  @ApiProperty()
  totalUnits: number;

  @ApiProperty()
  totalResidents: number;

  @ApiProperty()
  activeTickets: number;

  @ApiProperty()
  pendingExpenses: number;

  @ApiProperty()
  monthlyRevenue: number;

  @ApiProperty()
  collectionRate: number;
}

export class ExpenseTrendDto {
  @ApiProperty()
  period: string;

  @ApiProperty()
  total: number;

  @ApiProperty()
  collected: number;
}

export class RecentActivityDto {
  @ApiProperty()
  type: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  date: Date;

  @ApiProperty()
  buildingName?: string;
}