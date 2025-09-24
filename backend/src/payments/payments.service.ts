import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { UserRole } from '../common/types';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(createPaymentDto: CreatePaymentDto, userId: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id: createPaymentDto.expenseId },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    return this.prisma.payment.create({
      data: {
        ...createPaymentDto,
        userId,
        date: new Date(),
      },
      include: {
        expense: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findAll(userId: string, userRole: UserRole, buildingId?: string) {
    const where: any = {};

    if (userRole === UserRole.RESIDENT) {
      where.userId = userId;
    } else if (userRole === UserRole.ADMIN && buildingId) {
      where.expense = {
        buildingId: buildingId,
      };
    }

    return this.prisma.payment.findMany({
      where,
      include: {
        expense: {
          include: {
            building: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async findOne(id: string, userId: string, userRole: UserRole) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        expense: {
          include: {
            building: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (userRole === UserRole.RESIDENT && payment.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return payment;
  }

  async processPayment(processPaymentDto: ProcessPaymentDto, userId: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id: processPaymentDto.expenseId },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    // Simular procesamiento de pago (Stripe/MercadoPago mock)
    const paymentResult = await this.simulatePayment(processPaymentDto);

    const payment = await this.prisma.payment.create({
      data: {
        amount: expense.amount,
        method: processPaymentDto.paymentMethod,
        expenseId: processPaymentDto.expenseId,
        userId,
        date: new Date(),
        receiptUrl: paymentResult.receiptUrl,
      },
      include: {
        expense: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Actualizar estado de la expensa si está completamente pagada
    await this.updateExpenseStatus(expense.id);

    return payment;
  }

  private async simulatePayment(processPaymentDto: ProcessPaymentDto) {
    // Simular procesamiento de pago
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      transactionId: `tx_${Date.now()}`,
      receiptUrl: `https://example.com/receipts/${Date.now()}`,
    };
  }

  private async updateExpenseStatus(expenseId: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id: expenseId },
      include: { payments: true },
    });

    if (!expense) return;

    const totalPaid = expense.payments.reduce((sum, payment) => sum + payment.amount, 0);
    
    if (totalPaid >= expense.amount) {
      await this.prisma.expense.update({
        where: { id: expenseId },
        data: { status: 'PAID' },
      });
    }
  }
}