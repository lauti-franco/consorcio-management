// src/buildings/buildings.controller.ts - ACTUALIZADO COMPLETO
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { BuildingsService } from './buildings.service';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('buildings')
@Controller('buildings')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BuildingsController {
  constructor(private readonly buildingsService: BuildingsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new building (property)' })
  create(@Req() req: Request, @Body() createBuildingDto: CreateBuildingDto) {
    return this.buildingsService.create({
      ...createBuildingDto,
      tenantId: req.tenant.id, // â† tenant del middleware
      ownerId: (req.user as any).id // â† user del JWT
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all buildings (properties) for current tenant' })
  findAll(@Req() req: Request) {
    return this.buildingsService.findAllByTenant(req.tenant.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get building (property) by ID' })
  findOne(@Req() req: Request, @Param('id') id: string) {
    return this.buildingsService.findOne(id, req.tenant.id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update building (property)' })
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateBuildingDto: UpdateBuildingDto
  ) {
    return this.buildingsService.update(id, updateBuildingDto, req.tenant.id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete building (property) - soft delete' })
  remove(@Req() req: Request, @Param('id') id: string) {
    return this.buildingsService.remove(id, req.tenant.id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get building (property) statistics' })
  getStats(@Req() req: Request, @Param('id') id: string) {
    return this.buildingsService.getPropertyStats(id, req.tenant.id);
  }

  @Get('tenant/info')
  @ApiOperation({ summary: 'Get current tenant buildings info' })
  getTenantInfo(@Req() req: Request) {
    return {
      tenant: {
        id: req.tenant.id,
        name: req.tenant.name,
        description: req.tenant.description
      },
      userRole: req.userTenantRole,
      message: 'Multi-tenant context is working correctly'
    };
  }
}
