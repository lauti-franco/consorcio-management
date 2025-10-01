// src/payments/payments.controller.ts - CORRECCIÃ“N FINAL
import { Controller, Get, Post, Body, Param, UseGuards, Req, Query, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { UserRole } from '@prisma/client';


// Interface que coincide con lo que devuelve jwt.strategy.ts
interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  phone: string | null;
  avatar: string | null;
  isActive: boolean;
  tenantId: string;
  tenant: {
    id: string;
    name: string;
  };
  userTenants: Array<{
    tenantId: string;
    role: UserRole;
    tenant: {
      id: string;
      name: string;
    };
  }>;
  ownedProperties: Array<{
    id: string;
    name: string;
  }>;
}

@ApiTags('payments')
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  private getAuthenticatedUser(req: Request): AuthenticatedUser {
    return req.user as AuthenticatedUser;
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a payment record (Admin only)' })
  create(@Body() createPaymentDto: CreatePaymentDto, @Req() req: Request) {
    const user = this.getAuthenticatedUser(req);
    return this.paymentsService.create({
      ...createPaymentDto,
      tenantId: user.tenantId
    }, user.id);
  }

  @Post('process')
  @Roles(UserRole.RESIDENT, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Process a payment' })
  processPayment(@Body() processPaymentDto: ProcessPaymentDto, @Req() req: Request) {
    const user = this.getAuthenticatedUser(req);
    return this.paymentsService.processPayment({
      ...processPaymentDto,
      tenantId: user.tenantId
    }, user.id);
  }

  @Post('mercadopago/preference')
  @Roles(UserRole.RESIDENT, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create MercadoPago payment preference' })
  async createMercadoPagoPreference(
    @Body('expenseId') expenseId: string,
    @Req() req: Request
  ) {
    const user = this.getAuthenticatedUser(req);
    return this.paymentsService.createMercadoPagoPreference(
      expenseId,
      user.id,
      user.tenantId
    );
  }

  @Post('webhook/mercadopago')
  @HttpCode(200)
  @ApiOperation({ summary: 'MercadoPago webhook for payment notifications' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async handleMercadoPagoWebhook(@Body() webhookData: any) {
    return this.paymentsService.processMercadoPagoWebhook(webhookData);
  }

  @Get()
  @ApiOperation({ summary: 'Get all payments for current tenant' })
  findAll(
    @Req() req: Request, 
    @Query('propertyId') propertyId?: string
  ) {
    const user = this.getAuthenticatedUser(req);
    return this.paymentsService.findAll(
      user.id, 
      user.role,
      user.tenantId,
      propertyId
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get payment statistics for current tenant' })
  getStats(
    @Req() req: Request, 
    @Query('propertyId') propertyId?: string
  ) {
    const user = this.getAuthenticatedUser(req);
    return this.paymentsService.getPaymentStats(
      user.id, 
      user.role,
      user.tenantId,
      propertyId
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  findOne(@Param('id') id: string, @Req() req: Request) {
    const user = this.getAuthenticatedUser(req);
    return this.paymentsService.findOne(
      id, 
      user.id, 
      user.role,
      user.tenantId
    );
  }
}
