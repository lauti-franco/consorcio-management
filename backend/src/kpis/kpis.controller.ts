// src/kpis/kpis.controller.ts
import { Controller, Get, UseGuards, Req, Query } from '@nestjs/common';
import { KpisService } from './kpis.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('kpis')
@Controller('kpis')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class KpisController {
  constructor(private readonly kpisService: KpisService) {}

  @Get('advanced')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get advanced KPIs for dashboard' })
  getAdvancedKPIs(
    @Req() req: any,
    @Query('period') period: string = '30d'
  ) {
    return this.kpisService.getAdvancedKPIs(
      req.tenant.id, 
      req.user.id, 
      period
    );
  }

  @Get('financial')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get financial KPIs' })
  getFinancialKPIs(
    @Req() req: any,
    @Query('period') period: string = '30d'
  ) {
    return this.kpisService.getAdvancedKPIs(req.tenant.id, req.user.id, period)
      .then(kpis => kpis.financial);
  }

  @Get('maintenance')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MAINTENANCE)
  @ApiOperation({ summary: 'Get maintenance KPIs' })
  getMaintenanceKPIs(
    @Req() req: any,
    @Query('period') period: string = '30d'
  ) {
    return this.kpisService.getAdvancedKPIs(req.tenant.id, req.user.id, period)
      .then(kpis => kpis.maintenance);
  }
}