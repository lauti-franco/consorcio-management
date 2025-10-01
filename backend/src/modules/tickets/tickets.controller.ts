// src/tickets/tickets.controller.ts - CORREGIDO PARA MULTI-TENANT
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { UserRole } from '@prisma/client'; // CAMBIADO: usar enum de Prisma

@ApiTags('tickets')
@Controller('tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @Roles(UserRole.RESIDENT, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new ticket' })
  create(@Body() createTicketDto: CreateTicketDto, @Req() req: Request) {
    return this.ticketsService.create({
      ...createTicketDto,
      tenantId: req.tenant.id // â† AGREGADO: tenant del middleware
    }, (req.user as any).id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tickets for current tenant' })
  @ApiQuery({ name: 'propertyId', required: false, type: String, description: 'Filter by property ID' }) // CAMBIADO: buildingId â†’ propertyId
  findAll(
    @Req() req: Request, 
    @Query('propertyId') propertyId?: string
  ) {
    return this.ticketsService.findAll(
      (req.user as any).id, 
      req.userTenantRole, // â† CAMBIADO: usar userTenantRole del middleware
      req.tenant.id, // â† AGREGADO: tenant del middleware
      propertyId
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ticket by ID' })
  findOne(@Param('id') id: string, @Req() req: Request) {
    return this.ticketsService.findOne(
      id, 
      (req.user as any).id, 
      req.userTenantRole, // â† CAMBIADO: usar userTenantRole del middleware
      req.tenant.id // â† AGREGADO: tenant del middleware
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update ticket' })
  update(
    @Param('id') id: string, 
    @Body() updateTicketDto: UpdateTicketDto, 
    @Req() req: Request
  ) {
    return this.ticketsService.update(
      id, 
      updateTicketDto, 
      (req.user as any).id, 
      req.userTenantRole, // â† CAMBIADO: usar userTenantRole del middleware
      req.tenant.id // â† AGREGADO: tenant del middleware
    );
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete ticket (Admin only)' })
  remove(@Param('id') id: string, @Req() req: Request) {
    return this.ticketsService.remove(
      id, 
      (req.user as any).id, 
      req.userTenantRole, // â† CAMBIADO: usar userTenantRole del middleware
      req.tenant.id // â† AGREGADO: tenant del middleware
    );
  }

  @Post(':id/assign-to-me')
  @Roles(UserRole.MAINTENANCE)
  @ApiOperation({ summary: 'Assign ticket to current user (Maintenance only)' })
  assignToMe(@Param('id') id: string, @Req() req: Request) {
    return this.ticketsService.assignToMe(
      id, 
      (req.user as any).id,
      req.tenant.id // â† AGREGADO: tenant del middleware
    );
  }

  @Post(':id/complete')
  @Roles(UserRole.MAINTENANCE, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Mark ticket as completed' })
  completeTicket(@Param('id') id: string, @Req() req: Request) {
    return this.ticketsService.completeTicket(
      id, 
      (req.user as any).id, 
      req.userTenantRole, // â† CAMBIADO: usar userTenantRole del middleware
      req.tenant.id // â† AGREGADO: tenant del middleware
    );
  }

  @Post(':id/photos')
  @ApiOperation({ summary: 'Add photo to ticket' })
  addPhoto(
    @Param('id') id: string, 
    @Body('photoUrl') photoUrl: string, 
    @Req() req: Request
  ) {
    return this.ticketsService.addPhoto(
      id, 
      photoUrl, 
      (req.user as any).id, 
      req.userTenantRole, // â† CAMBIADO: usar userTenantRole del middleware
      req.tenant.id // â† AGREGADO: tenant del middleware
    );
  }

  @Get('stats/overview')
  @ApiOperation({ summary: 'Get ticket statistics for current tenant' })
  @ApiQuery({ name: 'propertyId', required: false, type: String, description: 'Filter by property ID' }) // CAMBIADO: buildingId â†’ propertyId
  getStats(
    @Req() req: Request, 
    @Query('propertyId') propertyId?: string
  ) {
    return this.ticketsService.getStats(
      (req.user as any).id, 
      req.userTenantRole, // â† CAMBIADO: usar userTenantRole del middleware
      req.tenant.id, // â† AGREGADO: tenant del middleware
      propertyId
    );
  }
}
