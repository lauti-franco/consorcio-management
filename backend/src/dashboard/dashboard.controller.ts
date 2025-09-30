// src/dashboard/dashboard.controller.ts - VERSIÓN SIMPLIFICADA
import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  private getUserId(req: Request): string {
    return (req as any).user?.id;
  }

  private getTenantId(req: Request): string {
    return (req as any).tenant?.id;
  }

  private getUserRole(req: Request): UserRole {
    return (req as any).user?.role;
  }

  @Get('admin')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get admin dashboard data for current tenant' })
  getAdminDashboard(@Req() req: Request) {
    return this.dashboardService.getAdminDashboard(
      this.getUserId(req),
      this.getTenantId(req)
    );
  }

  @Get('resident')
  @Roles(UserRole.RESIDENT)
  @ApiOperation({ summary: 'Get resident dashboard data for current tenant' })
  getResidentDashboard(@Req() req: Request) {
    return this.dashboardService.getResidentDashboard(
      this.getUserId(req),
      this.getTenantId(req)
    );
  }

  @Get('maintenance')
  @Roles(UserRole.MAINTENANCE)
  @ApiOperation({ summary: 'Get maintenance dashboard data for current tenant' })
  getMaintenanceDashboard(@Req() req: Request) {
    return this.dashboardService.getMaintenanceDashboard(
      this.getUserId(req),
      this.getTenantId(req)
    );
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.RESIDENT, UserRole.MAINTENANCE, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get dashboard data based on user role' })
  getDashboard(@Req() req: Request) {
    return this.dashboardService.getDashboardByRole(
      this.getUserId(req),
      this.getTenantId(req),
      this.getUserRole(req)
    );
  }
}