// src/users/users.controller.ts - CORREGIDO PARA MULTI-TENANT
import { Controller, Get, Param, Delete, UseGuards, Query, Req, Patch, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { UserRole } from '@prisma/client'; // CAMBIADO: usar enum de Prisma
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all users for current tenant (Admin only)' })
  findAll(
    @Req() req: Request, 
    @Query('role') role?: UserRole, 
    @Query('propertyId') propertyId?: string // CAMBIADO: buildingId â†’ propertyId
  ) {
    return this.usersService.findAll(
      (req.user as any).id, 
      req.userTenantRole, // â† CAMBIADO: usar userTenantRole del middleware
      req.tenant.id, // â† AGREGADO: tenant del middleware
      role, 
      propertyId
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  findOne(@Param('id') id: string, @Req() req: Request) {
    return this.usersService.findOne(
      id, 
      (req.user as any).id, 
      req.userTenantRole, // â† CAMBIADO: usar userTenantRole del middleware
      req.tenant.id // â† AGREGADO: tenant del middleware
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  update(
    @Param('id') id: string, 
    @Body() updateData: any, 
    @Req() req: Request
  ) {
    return this.usersService.update(
      id, 
      updateData, 
      (req.user as any).id, 
      req.userTenantRole, // â† CAMBIADO: usar userTenantRole del middleware
      req.tenant.id // â† AGREGADO: tenant del middleware
    );
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN) // â† CAMBIADO: solo SUPER_ADMIN puede eliminar del tenant
  @ApiOperation({ summary: 'Remove user from current tenant (Super Admin only)' })
  remove(@Param('id') id: string, @Req() req: Request) {
    return this.usersService.remove(
      id, 
      (req.user as any).id, 
      req.userTenantRole, // â† CAMBIADO: usar userTenantRole del middleware
      req.tenant.id // â† AGREGADO: tenant del middleware
    );
  }

  @Patch(':id/deactivate')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Deactivate user in current tenant (Admin only)' })
  deactivate(@Param('id') id: string, @Req() req: Request) {
    return this.usersService.deactivate(
      id, 
      (req.user as any).id, 
      req.userTenantRole, // â† CAMBIADO: usar userTenantRole del middleware
      req.tenant.id // â† AGREGADO: tenant del middleware
    );
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get user statistics for current tenant' })
  getUserStats(@Param('id') id: string, @Req() req: Request) {
    return this.usersService.getUserStats(
      id,
      req.tenant.id // â† AGREGADO: tenant del middleware
    );
  }
}
