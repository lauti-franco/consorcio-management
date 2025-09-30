// src/payments/payments.service.ts - VERSIÓN MOCK PARA PRUEBAS INMEDIATAS
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { UserRole, PaymentMethod, PaymentStatus } from '@prisma/client';

// TEMPORAL: Comentado para pruebas sin MercadoPago
// import mercadopago from 'mercadopago';

@Injectable()
export class PaymentsService {
  // TEMPORAL: Sin MercadoPago
  // private mercadoPago;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    // TEMPORAL: Sin configuración de MercadoPago
    // this.mercadoPago = mercadopago;
    // const accessToken = this.configService.get<string>('MERCADOPAGO_ACCESS_TOKEN');
    // if (accessToken) {
    //   this.mercadoPago.configure({
    //     access_token: accessToken,
    //   });
    // }
  }

  async create(createPaymentDto: CreatePaymentDto & { tenantId: string }, userId: string) {
    // Verificar que la expensa existe en el tenant
    const expense = await this.prisma.expense.findFirst({
      where: { 
        id: createPaymentDto.expenseId,
        tenantId: createPaymentDto.tenantId 
      },
      include: { 
        unit: true,
        property: true
      },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found in this tenant');
    }

    if (!expense.unitId) {
      throw new NotFoundException('Expense must be associated with a unit');
    }

    // Verificar que el usuario tiene acceso a la unidad en este tenant
    const unitAccess = await this.prisma.unit.findFirst({
      where: {
        id: expense.unitId,
        managerId: userId,
        tenantId: createPaymentDto.tenantId
      },
    });

    if (!unitAccess) {
      throw new ForbiddenException('No tienes permisos para crear pagos en esta unidad');
    }

    return this.prisma.payment.create({
      data: {
        amount: createPaymentDto.amount,
        method: createPaymentDto.method,
        status: PaymentStatus.COMPLETED,
        expenseId: createPaymentDto.expenseId,
        userId: userId,
        unitId: expense.unitId,
        tenantId: createPaymentDto.tenantId,
        date: new Date(),
      },
      include: {
        expense: {
          include: {
            property: {
              select: {
                id: true,
                name: true,
                address: true
              }
            },
            unit: {
              select: {
                id: true,
                number: true,
                floor: true
              }
            },
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
            floor: true,
            property: {
              select: {
                id: true,
                name: true
              }
            }
          },
        },
      },
    });
  }

  async createMercadoPagoPreference(expenseId: string, userId: string, tenantId: string) {
    console.log('📱 Creando preferencia MOCK de MercadoPago...');
    
    // Verificar que la expensa existe y el usuario tiene acceso
    const expense = await this.prisma.expense.findFirst({
      where: { 
        id: expenseId,
        tenantId: tenantId 
      },
      include: { 
        unit: {
          include: {
            property: true,
            manager: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        property: true
      },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found in this tenant');
    }

    // Verificar permisos del usuario
    const unitAccess = await this.prisma.unit.findFirst({
      where: {
        id: expense.unitId,
        managerId: userId,
        tenantId: tenantId
      },
    });

    if (!unitAccess) {
      throw new ForbiddenException('No tienes permisos para pagar esta expensa');
    }

    // VERSIÓN MOCK - Simular respuesta de MercadoPago
    const mockPreferenceId = `mock_pref_${Date.now()}`;
    
    console.log(`✅ Preferencia MOCK creada: ${mockPreferenceId} para expensa: ${expenseId}`);

    // Guardar la preferencia en la base de datos como pago pendiente
    await this.prisma.payment.create({
      data: {
        amount: expense.amount,
        method: PaymentMethod.CARD,
        status: PaymentStatus.PENDING,
        expenseId: expenseId,
        userId: userId,
        unitId: expense.unitId,
        tenantId: tenantId,
        date: new Date(),
        transactionId: mockPreferenceId,
      },
    });

    return {
      preferenceId: mockPreferenceId,
      init_point: `https://mercadopago-mock.com/checkout/${mockPreferenceId}`,
      sandbox_init_point: `https://sandbox.mercadopago-mock.com/checkout/${mockPreferenceId}`,
      expense: {
        id: expense.id,
        concept: expense.concept,
        amount: expense.amount,
        period: expense.period
      },
      message: "✅ PREFERENCIA MOCK - Para probar el flujo completo"
    };
  }

  async processMercadoPagoWebhook(webhookData: any) {
    console.log('🔔 Webhook MOCK recibido:', webhookData);
    
    try {
      const { type, data } = webhookData;
      
      if (type === 'payment') {
        const paymentId = data.id;
        console.log(`🔄 Procesando pago MOCK: ${paymentId}`);
        
        // SIMULAR procesamiento exitoso
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('✅ Webhook MOCK procesado exitosamente');
        return { 
          success: true, 
          message: 'Webhook MOCK processed successfully',
          data: {
            paymentId: paymentId,
            status: 'approved',
            amount: 15000.50
          }
        };
      }
      
      return { 
        success: true, 
        message: 'Webhook MOCK ignored - tipo no manejado',
        type: type
      };
    } catch (error) {
      console.error('❌ Error procesando webhook MOCK:', error);
      return { 
        success: false, 
        message: 'Error processing MOCK webhook: ' + error.message 
      };
    }
  }

  async processPayment(processPaymentDto: ProcessPaymentDto & { tenantId: string }, userId: string) {
    // Si el método de pago es MercadoPago, crear preferencia MOCK
    if (processPaymentDto.paymentMethod === PaymentMethod.CARD && 
        processPaymentDto.processor === 'MERCADOPAGO') {
      return this.createMercadoPagoPreference(processPaymentDto.expenseId, userId, processPaymentDto.tenantId);
    }

    // Para otros métodos (efectivo, transferencia) mantener lógica existente
    const expense = await this.prisma.expense.findFirst({
      where: { 
        id: processPaymentDto.expenseId,
        tenantId: processPaymentDto.tenantId 
      },
      include: { 
        unit: true,
        property: true
      },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found in this tenant');
    }

    if (!expense.unitId) {
      throw new NotFoundException('Expense must be associated with a unit');
    }

    // Verificar que el usuario tiene acceso a la unidad en este tenant
    const unitAccess = await this.prisma.unit.findFirst({
      where: {
        id: expense.unitId,
        managerId: userId,
        tenantId: processPaymentDto.tenantId
      },
    });

    if (!unitAccess) {
      throw new ForbiddenException('No tienes permisos para pagar esta expensa en este tenant');
    }

    // Simular procesamiento de pago
    const paymentResult = await this.simulatePayment(processPaymentDto);

    const payment = await this.prisma.payment.create({
      data: {
        amount: expense.amount,
        method: processPaymentDto.paymentMethod,
        status: PaymentStatus.COMPLETED,
        expenseId: processPaymentDto.expenseId,
        userId: userId,
        unitId: expense.unitId,
        tenantId: processPaymentDto.tenantId,
        date: new Date(),
        transactionId: paymentResult.transactionId,
        receiptUrl: paymentResult.receiptUrl,
      },
      include: {
        expense: {
          include: {
            property: {
              select: {
                id: true,
                name: true,
                address: true
              }
            },
            unit: {
              select: {
                id: true,
                number: true,
                floor: true
              }
            },
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
            floor: true,
            property: {
              select: {
                id: true,
                name: true
              }
            }
          },
        },
      },
    });

    // Actualizar estado de la expensa
    await this.updateExpenseStatus(expense.id, processPaymentDto.tenantId);

    return payment;
  }

  async findAll(userId: string, userRole: UserRole, tenantId: string, propertyId?: string) {
    const where: any = { tenantId };

    if (userRole === UserRole.RESIDENT) {
      where.unit = {
        managerId: userId,
        tenantId: tenantId
      };
    } else if (userRole === UserRole.ADMIN || userRole === UserRole.SUPER_ADMIN) {
      if (propertyId) {
        where.expense = {
          propertyId: propertyId,
          tenantId: tenantId
        };
      } else {
        where.expense = {
          property: {
            ownerId: userId,
            tenantId: tenantId
          }
        };
      }
    } else if (userRole === UserRole.MAINTENANCE) {
      const maintenanceProperties = await this.prisma.property.findMany({
        where: {
          tenantId: tenantId,
          tickets: {
            some: {
              assignedToId: userId
            }
          }
        },
        select: { id: true }
      });

      where.expense = {
        propertyId: {
          in: maintenanceProperties.map(prop => prop.id)
        },
        tenantId: tenantId
      };
    }

    return this.prisma.payment.findMany({
      where,
      include: {
        expense: {
          include: {
            property: {
              select: {
                id: true,
                name: true,
                address: true
              }
            },
            unit: {
              select: {
                id: true,
                number: true,
                floor: true
              }
            },
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
            floor: true,
            property: {
              select: {
                id: true,
                name: true
              }
            }
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async findOne(id: string, userId: string, userRole: UserRole, tenantId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { 
        id,
        tenantId
      },
      include: {
        expense: {
          include: {
            property: {
              select: {
                id: true,
                name: true,
                address: true
              }
            },
            unit: {
              select: {
                id: true,
                number: true,
                floor: true
              }
            },
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
            floor: true,
            property: {
              select: {
                id: true,
                name: true
              }
            }
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found in this tenant');
    }

    await this.verifyPaymentAccess(payment, userId, userRole, tenantId);

    return payment;
  }

  async getPaymentStats(userId: string, userRole: UserRole, tenantId: string, propertyId?: string) {
    const where: any = { tenantId };

    if (userRole === UserRole.RESIDENT) {
      where.unit = {
        managerId: userId,
        tenantId: tenantId
      };
    } else if (userRole === UserRole.ADMIN || userRole === UserRole.SUPER_ADMIN) {
      if (propertyId) {
        where.expense = {
          propertyId: propertyId,
          tenantId: tenantId
        };
      } else {
        where.expense = {
          property: {
            ownerId: userId,
            tenantId: tenantId
          }
        };
      }
    } else if (userRole === UserRole.MAINTENANCE) {
      const maintenanceProperties = await this.prisma.property.findMany({
        where: {
          tenantId: tenantId,
          tickets: {
            some: {
              assignedToId: userId
            }
          }
        },
        select: { id: true }
      });

      where.expense = {
        propertyId: {
          in: maintenanceProperties.map(prop => prop.id)
        },
        tenantId: tenantId
      };
    }

    const [totalPayments, totalAmount, monthlyRevenue, completedPayments] = await Promise.all([
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
      this.prisma.payment.count({
        where: {
          ...where,
          status: PaymentStatus.COMPLETED
        }
      })
    ]);

    return {
      totalPayments,
      totalAmount: totalAmount._sum.amount || 0,
      monthlyRevenue: monthlyRevenue._sum.amount || 0,
      completedPayments,
      successRate: totalPayments > 0 ? (completedPayments / totalPayments) * 100 : 0
    };
  }

  private async simulatePayment(processPaymentDto: ProcessPaymentDto) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      transactionId: `tx_${Date.now()}`,
      receiptUrl: `https://example.com/receipts/${Date.now()}`,
    };
  }

  private async updateExpenseStatus(expenseId: string, tenantId: string) {
    const expense = await this.prisma.expense.findFirst({
      where: { 
        id: expenseId,
        tenantId: tenantId 
      },
      include: { 
        payments: {
          where: {
            tenantId: tenantId,
            status: PaymentStatus.COMPLETED
          }
        } 
      },
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
        data: { status: 'OPEN' },
      });
    }
  }

  private async verifyPaymentAccess(payment: any, userId: string, userRole: UserRole, tenantId: string) {
    if (userRole === UserRole.ADMIN || userRole === UserRole.SUPER_ADMIN) {
      const property = await this.prisma.property.findFirst({
        where: {
          id: payment.expense.propertyId,
          ownerId: userId,
          tenantId: tenantId
        },
      });

      if (!property) {
        throw new ForbiddenException('Access denied to this payment');
      }
      return true;
    }

    if (userRole === UserRole.RESIDENT) {
      if (payment.unit.managerId !== userId) {
        throw new ForbiddenException('Access denied to this payment');
      }
      return true;
    }

    if (userRole === UserRole.MAINTENANCE) {
      const maintenanceAccess = await this.prisma.ticket.findFirst({
        where: {
          propertyId: payment.expense.propertyId,
          assignedToId: userId,
          tenantId: tenantId
        }
      });

      if (!maintenanceAccess) {
        throw new ForbiddenException('Access denied to this payment');
      }
      return true;
    }

    throw new ForbiddenException('Access denied to this payment');
  }

  private mapMercadoPagoStatus(mercadoPagoStatus: string): PaymentStatus {
    switch (mercadoPagoStatus) {
      case 'approved':
        return PaymentStatus.COMPLETED;
      case 'pending':
        return PaymentStatus.PENDING;
      case 'in_process':
        return PaymentStatus.PENDING;
      case 'rejected':
        return PaymentStatus.FAILED;
      case 'cancelled':
        return PaymentStatus.FAILED;
      case 'refunded':
        return PaymentStatus.REFUNDED;
      default:
        return PaymentStatus.PENDING;
    }
  }

  private async sendPaymentNotification(expenseId: string, userId: string, tenantId: string, status: string) {
    console.log(`📧 Notificación MOCK: Expensa ${expenseId}, Usuario ${userId}, Estado ${status}`);
  }
}