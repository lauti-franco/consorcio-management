import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/types';

@ApiTags('tickets')
@Controller('tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @Roles(UserRole.RESIDENT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new ticket' })
  create(@Body() createTicketDto: CreateTicketDto, @Req() req: any) {
    return this.ticketsService.create(createTicketDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tickets' })
  findAll(@Req() req: any) {
    return this.ticketsService.findAll(req.user.id, req.user.role);
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

  @Post(':id/assign-to-me')
  @Roles(UserRole.MAINTENANCE)
  @ApiOperation({ summary: 'Assign ticket to current user (Maintenance only)' })
  assignToMe(@Param('id') id: string, @Req() req: any) {
    return this.ticketsService.assignToMe(id, req.user.id);
  }
}