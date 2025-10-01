// src/units/units.controller.ts - CORREGIDO PARA MULTI-TENANT
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { UnitsService } from './units.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('units')
@Controller('units')
@UseGuards(JwtAuthGuard, RolesGuard) // â† AGREGADO: RolesGuard
@ApiBearerAuth()
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new unit' })
  create(@Body() createUnitDto: CreateUnitDto, @Req() req: Request) {
    return this.unitsService.create({
      ...createUnitDto,
      tenantId: req.tenant.id // â† AGREGADO: tenant del middleware
    }, (req.user as any).id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all units for a property in current tenant' })
  @ApiQuery({ name: 'propertyId', required: true, type: String, description: 'Property ID' }) // CAMBIADO: buildingId â†’ propertyId
  findAll(
    @Query('propertyId') propertyId: string, 
    @Req() req: Request
  ) {
    return this.unitsService.findAll(
      propertyId, 
      (req.user as any).id,
      req.tenant.id // â† AGREGADO: tenant del middleware
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get unit by ID' })
  findOne(@Param('id') id: string, @Req() req: Request) {
    return this.unitsService.findOne(
      id, 
      (req.user as any).id,
      req.tenant.id // â† AGREGADO: tenant del middleware
    );
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get unit statistics' })
  getStats(@Param('id') id: string, @Req() req: Request) {
    return this.unitsService.getUnitStats(
      id, 
      (req.user as any).id,
      req.tenant.id // â† AGREGADO: tenant del middleware
    );
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update unit' })
  update(
    @Param('id') id: string, 
    @Body() updateUnitDto: UpdateUnitDto, 
    @Req() req: Request
  ) {
    return this.unitsService.update(
      id, 
      updateUnitDto, 
      (req.user as any).id,
      req.tenant.id // â† AGREGADO: tenant del middleware
    );
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete unit' })
  remove(@Param('id') id: string, @Req() req: Request) {
    return this.unitsService.remove(
      id, 
      (req.user as any).id,
      req.tenant.id // â† AGREGADO: tenant del middleware
    );
  }
}
