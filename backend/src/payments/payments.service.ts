import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { UserRole, PaymentMethod, PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(createPaymentDto: CreatePaymentDto, userId: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id: createPaymentDto.expenseId },
      include: { unit: true },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    if (!expense.unitId) {
      throw new NotFoundException('Expense must be associated with a unit');
    }

    return this.prisma.payment.create({
      data: {
        amount: createPaymentDto.amount,
        method: createPaymentDto.method as PaymentMethod, // CONVERTIR a enum
        status: PaymentStatus.COMPLETED,
        expenseId: createPaymentDto.expenseId,
        userId: userId,
        unitId: expense.unitId, // AGREGAR unitId requerido
        date: new Date(),
      },
      include: {
        expense: {
          include: {
            building: true,
            unit: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        unit: {
          select: {
            id: true,
            number: true,
            building: true,
          },
        },
      },
    });
  }

  async findAll(userId: string, userRole: UserRole, buildingId?: string) {
    const where: any = {};

    if (userRole === UserRole.RESIDENT) {
      // Residentes ven pagos de sus unidades
      where.unit = {
        managerId: userId,
      };
    } else if (userRole === UserRole.ADMIN) {
      // Admins ven pagos de sus edificios
      if (buildingId) {
        where.expense = {
          buildingId: buildingId,
        };
      } else {
        where.expense = {
          building: {
            ownerId: userId,
          },
        };
      }
    }

    return this.prisma.payment.findMany({
      where,
      include: {
        expense: {
          include: {
            building: true,
            unit: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        unit: {
          select: {
            id: true,
            number: true,
            building: true,
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
            unit: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        unit: {
          select: {
            id: true,
            number: true,
            building: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Verificar permisos de acceso
    await this.verifyPaymentAccess(payment, userId, userRole);

    return payment;
  }

  async processPayment(processPaymentDto: ProcessPaymentDto, userId: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id: processPaymentDto.expenseId },
      include: { unit: true },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    if (!expense.unitId) {
      throw new NotFoundException('Expense must be associated with a unit');
    }

    // Verificar que el usuario tiene acceso a la unidad
    const unitAccess = await this.prisma.unit.findFirst({
      where: {
        id: expense.unitId,
        managerId: userId,
      },
    });

    if (!unitAccess) {
      throw new ForbiddenException('No tienes permisos para pagar esta expensa');
    }

    // Simular procesamiento de pago
    const paymentResult = await this.simulatePayment(processPaymentDto);

    const payment = await this.prisma.payment.create({
      data: {
        amount: expense.amount,
        method: processPaymentDto.paymentMethod as PaymentMethod, // CONVERTIR a enum
        status: PaymentStatus.COMPLETED,
        expenseId: processPaymentDto.expenseId,
        userId: userId,
        unitId: expense.unitId, // AGREGAR unitId
        date: new Date(),
        transactionId: paymentResult.transactionId,
        receiptUrl: paymentResult.receiptUrl,
      },
      include: {
        expense: {
          include: {
            building: true,
            unit: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        unit: {
          select: {
            id: true,
            number: true,
            building: true,
          },
        },
      },
    });

    // Actualizar estado de la expensa
    await this.updateExpenseStatus(expense.id);

    return payment;
  }

  async getPaymentStats(userId: string, userRole: UserRole, buildingId?: string) {
    const where: any = {};

    // Aplicar filtros según el rol
    if (userRole === UserRole.RESIDENT) {
      where.unit = {
        managerId: userId,
      };
    } else if (userRole === UserRole.ADMIN) {
      if (buildingId) {
        where.expense = {
          buildingId: buildingId,
        };
      } else {
        where.expense = {
          building: {
            ownerId: userId,
          },
        };
      }
    }

    const [totalPayments, totalAmount, monthlyRevenue] = await Promise.all([
      this.prisma.payment.count({ where }),
      this.prisma.payment.aggregate({
        where,
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: {
          ...where,
          date: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalPayments,
      totalAmount: totalAmount._sum.amount || 0,
      monthlyRevenue: monthlyRevenue._sum.amount || 0,
    };
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
    } else if (totalPaid > 0) {
      await this.prisma.expense.update({
        where: { id: expenseId },
        data: { status: 'OPEN'},
      });
    }
  }

  private async verifyPaymentAccess(payment: any, userId: string, userRole: UserRole) {
    if (userRole === UserRole.ADMIN) {
      // Admins tienen acceso si son dueños del edificio
      const building = await this.prisma.building.findFirst({
        where: {
          id: payment.expense.buildingId,
          ownerId: userId,
        },
      });

      if (!building) {
        throw new ForbiddenException('Access denied');
      }
      return true;
    }

    if (userRole === UserRole.RESIDENT) {
      // Residentes tienen acceso si son managers de la unidad
      if (payment.unit.managerId !== userId) {
        throw new ForbiddenException('Access denied');
      }
      return true;
    }

    throw new ForbiddenException('Access denied');
  }
}