import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { KpisService } from './kpis.service';

@Controller('kpis')
@UseGuards(JwtAuthGuard)
export class KpisController {
  constructor(private readonly kpisService: KpisService) {}

  @Get('advanced')
  getAdvancedKPIs(@Req() req: any) {
    const tenantId = req.user?.tenantId || req.tenantId || 'default-tenant';
    return this.kpisService.getAdvancedKPIs(tenantId);
  }

  @Get('basic')
  getBasicKPIs(@Req() req: any) {
    const tenantId = req.user?.tenantId || req.tenantId || 'default-tenant';
    return this.kpisService.getBasicKPIs(tenantId);
  }

  @Get('financial')
  getFinancialKPIs(@Req() req: any) {
    const tenantId = req.user?.tenantId || req.tenantId || 'default-tenant';
    const advancedKPIs = this.kpisService.getAdvancedKPIs(tenantId);
    return advancedKPIs.then(kpis => kpis.financial);
  }

  @Get('maintenance')
  getMaintenanceKPIs(@Req() req: any) {
    const tenantId = req.user?.tenantId || req.tenantId || 'default-tenant';
    const advancedKPIs = this.kpisService.getAdvancedKPIs(tenantId);
    return advancedKPIs.then(kpis => kpis.maintenance);
  }

  @Get('occupancy')
  getOccupancyKPIs(@Req() req: any) {
    const tenantId = req.user?.tenantId || req.tenantId || 'default-tenant';
    const advancedKPIs = this.kpisService.getAdvancedKPIs(tenantId);
    return advancedKPIs.then(kpis => kpis.occupancy);
  }

  @Get('property')
  getPropertyKPIs(@Req() req: any) {
    const tenantId = req.user?.tenantId || req.tenantId || 'default-tenant';
    const advancedKPIs = this.kpisService.getAdvancedKPIs(tenantId);
    return advancedKPIs.then(kpis => kpis.property);
  }

  @Get('trends')
  getTrends(@Req() req: any) {
    const tenantId = req.user?.tenantId || req.tenantId || 'default-tenant';
    const advancedKPIs = this.kpisService.getAdvancedKPIs(tenantId);
    return advancedKPIs.then(kpis => kpis.trends);
  }
}
