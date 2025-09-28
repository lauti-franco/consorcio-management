import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum'; 

@ApiTags('tickets')
@Controller('tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @Roles(UserRole.RESIDENT, UserRole.ADMIN) // AHORA compatible
  @ApiOperation({ summary: 'Create a new ticket' })
  create(@Body() createTicketDto: CreateTicketDto, @Req() req: any) {
    return this.ticketsService.create(createTicketDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tickets' })
  @ApiQuery({ name: 'buildingId', required: false, type: String })
  findAll(@Req() req: any, @Query('buildingId') buildingId?: string) {
    return this.ticketsService.findAll(req.user.id, req.user.role, buildingId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ticket by ID' })
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.ticketsService.findOne(id, req.user.id, req.user.role);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update ticket' })
  update(@Param('id') id: string, @Body() updateTicketDto: UpdateTicketDto, @Req() req: any) {
    return this.ticketsService.update(id, updateTicketDto, req.user.id, req.user.role);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN) // AHORA compatible
  @ApiOperation({ summary: 'Delete ticket (Admin only)' })
  remove(@Param('id') id: string, @Req() req: any) {
    return this.ticketsService.remove(id, req.user.id, req.user.role);
  }

  @Post(':id/assign-to-me')
  @Roles(UserRole.MAINTENANCE) // AHORA compatible
  @ApiOperation({ summary: 'Assign ticket to current user (Maintenance only)' })
  assignToMe(@Param('id') id: string, @Req() req: any) {
    return this.ticketsService.assignToMe(id, req.user.id);
  }

  @Post(':id/complete')
  @Roles(UserRole.MAINTENANCE, UserRole.ADMIN) // AHORA compatible
  @ApiOperation({ summary: 'Mark ticket as completed' })
  completeTicket(@Param('id') id: string, @Req() req: any) {
    return this.ticketsService.completeTicket(id, req.user.id, req.user.role);
  }

  @Post(':id/photos')
  @ApiOperation({ summary: 'Add photo to ticket' })
  addPhoto(@Param('id') id: string, @Body('photoUrl') photoUrl: string, @Req() req: any) {
    return this.ticketsService.addPhoto(id, photoUrl, req.user.id, req.user.role);
  }

  @Get('stats/overview')
  @ApiOperation({ summary: 'Get ticket statistics' })
  @ApiQuery({ name: 'buildingId', required: false, type: String })
  getStats(@Req() req: any, @Query('buildingId') buildingId?: string) {
    return this.ticketsService.getStats(req.user.id, req.user.role, buildingId);
  }
}