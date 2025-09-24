import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/types';

@ApiTags('payments')
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a payment record (Admin only)' })
  create(@Body() createPaymentDto: CreatePaymentDto, @Req() req: any) {
    return this.paymentsService.create(createPaymentDto, req.user.id);
  }

  @Post('process')
  @Roles(UserRole.RESIDENT)
  @ApiOperation({ summary: 'Process a payment (Resident only)' })
  processPayment(@Body() processPaymentDto: ProcessPaymentDto, @Req() req: any) {
    return this.paymentsService.processPayment(processPaymentDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all payments' })
  findAll(@Req() req: any) {
    return this.paymentsService.findAll(req.user.id, req.user.role, req.user.buildingId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.paymentsService.findOne(id, req.user.id, req.user.role);
  }
}