// src/expenses/expenses.controller.ts - CORREGIDO PARA MULTI-TENANT
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client'; // CAMBIADO: usar enum de Prisma

@ApiTags('expenses')
@Controller('expenses')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new expense' })
  create(@Body() createExpenseDto: CreateExpenseDto, @Req() req: Request) {
    return this.expensesService.create({
      ...createExpenseDto,
      tenantId: req.tenant.id // ← AGREGADO: tenant del middleware
    }, (req.user as any).id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all expenses for current tenant' })
  findAll(
    @Req() req: Request, 
    @Query('propertyId') propertyId?: string // CAMBIADO: buildingId → propertyId
  ) {
    return this.expensesService.findAll(
      (req.user as any).id, 
      req.userTenantRole, // ← CAMBIADO: usar userTenantRole del middleware
      req.tenant.id, // ← AGREGADO: tenant del middleware
      propertyId
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get expenses statistics for current tenant' })
  getStats(@Req() req: Request, @Query('propertyId') propertyId?: string) {
    return this.expensesService.getStats(
      req.tenant.id, // ← AGREGADO: tenant del middleware
      propertyId // CAMBIADO: buildingId → propertyId
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get expense by ID' })
  findOne(@Param('id') id: string, @Req() req: Request) {
    return this.expensesService.findOne(
      id, 
      (req.user as any).id, 
      req.userTenantRole, // ← CAMBIADO: usar userTenantRole del middleware
      req.tenant.id // ← AGREGADO: tenant del middleware
    );
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update expense' })
  update(
    @Param('id') id: string, 
    @Body() updateExpenseDto: UpdateExpenseDto, 
    @Req() req: Request
  ) {
    return this.expensesService.update(
      id, 
      updateExpenseDto, 
      (req.user as any).id,
      req.tenant.id // ← AGREGADO: tenant del middleware
    );
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete expense' })
  remove(@Param('id') id: string, @Req() req: Request) {
    return this.expensesService.remove(
      id, 
      (req.user as any).id,
      req.tenant.id // ← AGREGADO: tenant del middleware
    );
  }
}