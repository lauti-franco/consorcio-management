import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('admin')
  @ApiOperation({ summary: 'Get admin dashboard data' })
  getAdminDashboard(@CurrentUser() user: any) {
    return this.dashboardService.getAdminDashboard(user.id);
  }

  @Get('resident')
  @ApiOperation({ summary: 'Get resident dashboard data' })
  getResidentDashboard(@CurrentUser() user: any) {
    return this.dashboardService.getResidentDashboard(user.id);
  }

  @Get('maintenance')
  @ApiOperation({ summary: 'Get maintenance dashboard data' })
  getMaintenanceDashboard(@CurrentUser() user: any) {
    return this.dashboardService.getMaintenanceDashboard(user.id);
  }
}