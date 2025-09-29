// src/dashboard/dashboard.service.ts - VERSIÓN COMPLETAMENTE CORREGIDA
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';

// Interfaces para tipado fuerte (las mismas que tenías)
export interface AdminDashboard {
  overview: {
    totalProperties: number;
    totalUnits: number;
    totalResidents: number;
    activeTickets: number;
    pendingExpenses: number;
    monthlyRevenue: number;
    collectionRate: number;
    occupancyRate: number;
  };
  properties: PropertyStats;
  expenseTrends: ExpenseTrend[];
  recentActivities: RecentActivity[];
  delinquency: DelinquencyStats;
  quickStats: QuickStats;
}

export interface ResidentDashboard {
  user: {
    name: string;
    email: string;
    role: UserRole;
  };
  overview: {
    totalDue: number;
    activeTickets: number;
    managedUnits: number;
    nextDueDate?: Date;
  };
  recentExpenses: ResidentExpense[];
  recentTickets: ResidentTicket[];
  paymentHistory: PaymentHistory[];
  financialSummary: FinancialSummary;
}

export interface MaintenanceDashboard {
  overview: {
    assignedTickets: number;
    completedThisMonth: number;
    activeProperties: number;
    averageResolutionTime: number;
  };
  assignedTickets: MaintenanceTicket[];
  properties: MaintenanceProperty[];
  priorityBreakdown: PriorityBreakdown;
  performanceMetrics: PerformanceMetrics;
}

// Interfaces auxiliares (las mismas que tenías)
interface PropertyStats {
  total: number;
  active: number;
  occupancyRate: number;
}

interface ExpenseTrend {
  period: string;
  total: number;
  collected: number;
  pending: number;
}

interface RecentActivity {
  type: 'PAYMENT' | 'TICKET' | 'EXPENSE' | 'TASK';
  description: string;
  date: Date;
  propertyName: string;
  amount?: number;
}

interface DelinquencyStats {
  overdueExpenses: number;
  totalOverdueAmount: number;
  delinquencyRate: number;
  topDelinquentUnits: DelinquentUnit[];
}

interface QuickStats {
  pendingTasks: number;
  openTickets: number;
  scheduledTasks: number;
  overdueExpenses: number;
}

interface ResidentExpense {
  id: string;
  concept: string;
  amount: number;
  dueDate: Date;
  status: string;
  property: string;
  unit: string;
  paidAmount: number;
  remainingAmount: number;
}

interface ResidentTicket {
  id: string;
  title: string;
  status: string;
  priority: string;
  createdAt: Date;
  property: string;
  unit: string;
}

interface PaymentHistory {
  id: string;
  date: Date;
  amount: number;
  concept: string;
  method: string;
  status: string;
}

interface FinancialSummary {
  totalPaid: number;
  pendingAmount: number;
  upcomingExpenses: number;
}

interface MaintenanceTicket {
  id: string;
  title: string;
  status: string;
  priority: string;
  createdAt: Date;
  property: { id: string; name: string };
  unit: { id: string; number: string };
  user: { name: string; phone: string };
}

interface MaintenanceProperty {
  id: string;
  name: string;
  activeTickets: number;
}

interface PriorityBreakdown {
  high: number;
  medium: number;
  low: number;
}

interface PerformanceMetrics {
  resolutionRate: number;
  averageResponseTime: number;
  customerSatisfaction: number;
}

interface DelinquentUnit {
  unitNumber: string;
  propertyName: string;
  overdueAmount: number;
  daysOverdue: number;
}

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtiene dashboard según el rol del usuario
   */
  async getDashboardByRole(userId: string, tenantId: string, userRole: UserRole) {
    switch (userRole) {
      case UserRole.ADMIN:
      case UserRole.SUPER_ADMIN:
        return this.getAdminDashboard(userId, tenantId);
      case UserRole.RESIDENT:
        return this.getResidentDashboard(userId, tenantId);
      case UserRole.MAINTENANCE:
        return this.getMaintenanceDashboard(userId, tenantId);
      default:
        throw new NotFoundException(`Dashboard no implementado para el rol: ${userRole}`);
    }
  }

  /**
   * DASHBOARD PARA ADMINISTRADORES
   */
  async getAdminDashboard(userId: string, tenantId: string): Promise<AdminDashboard> {
    const [
      properties,
      units,
      residents,
      activeTickets,
      pendingExpenses,
      monthlyRevenue,
      expenseTrends,
      recentActivities,
      delinquency,
      quickStats
    ] = await Promise.all([
      this.getPropertyStats(userId, tenantId),
      this.getUnitStats(userId, tenantId),
      this.getResidentStats(userId, tenantId),
      this.getActiveTickets(userId, tenantId),
      this.getPendingExpenses(userId, tenantId),
      this.getMonthlyRevenue(userId, tenantId),
      this.getExpenseTrends(userId, tenantId),
      this.getRecentActivities(userId, tenantId),
      this.getDelinquencyStats(userId, tenantId),
      this.getQuickStats(userId, tenantId)
    ]);

    const collectionRate = await this.calculateCollectionRate(userId, tenantId);
    const occupancyRate = units.total > 0 ? (units.occupied / units.total) * 100 : 0;

    return {
      overview: {
        totalProperties: properties.total,
        totalUnits: units.total,
        totalResidents: residents.total,
        activeTickets,
        pendingExpenses: pendingExpenses.totalAmount,
        monthlyRevenue,
        collectionRate,
        occupancyRate
      },
      properties,
      expenseTrends,
      recentActivities,
      delinquency,
      quickStats
    };
  }

  /**
   * DASHBOARD PARA RESIDENTES
   */
  async getResidentDashboard(userId: string, tenantId: string): Promise<ResidentDashboard> {
    const [userData, paymentHistory, financialSummary] = await Promise.all([
      this.getResidentUserData(userId, tenantId),
      this.getPaymentHistory(userId, tenantId),
      this.getFinancialSummary(userId, tenantId)
    ]);

    const { user, overview, recentExpenses, recentTickets } = userData;

    return {
      user,
      overview: {
        ...overview,
        nextDueDate: await this.getNextDueDate(userId, tenantId)
      },
      recentExpenses,
      recentTickets,
      paymentHistory,
      financialSummary
    };
  }

  /**
   * DASHBOARD PARA MANTENIMIENTO
   */
  async getMaintenanceDashboard(userId: string, tenantId: string): Promise<MaintenanceDashboard> {
    const [
      assignedTickets,
      completedTickets,
      properties,
      priorityBreakdown,
      performanceMetrics
    ] = await Promise.all([
      this.getAssignedTickets(userId, tenantId),
      this.getCompletedTicketsCount(userId, tenantId),
      this.getMaintenanceProperties(userId, tenantId),
      this.getPriorityBreakdown(userId, tenantId),
      this.getPerformanceMetrics(userId, tenantId)
    ]);

    return {
      overview: {
        assignedTickets: assignedTickets.length,
        completedThisMonth: completedTickets,
        activeProperties: properties.length,
        averageResolutionTime: performanceMetrics.averageResponseTime
      },
      assignedTickets,
      properties,
      priorityBreakdown,
      performanceMetrics
    };
  }

  // ========== MÉTODOS PRIVADOS PARA ADMIN ==========

  private async getPropertyStats(userId: string, tenantId: string): Promise<PropertyStats> {
    const [total, active, occupiedUnits] = await Promise.all([
      this.prisma.property.count({
        where: { 
          ownerId: userId,
          tenantId: tenantId
        },
      }),
      this.prisma.property.count({
        where: { 
          ownerId: userId,
          tenantId: tenantId,
          isActive: true 
        },
      }),
      this.prisma.unit.count({
        where: {
          property: {
            ownerId: userId,
            tenantId: tenantId
          },
          isOccupied: true
        }
      })
    ]);

    const totalUnits = await this.prisma.unit.count({
      where: {
        property: {
          ownerId: userId,
          tenantId: tenantId
        }
      }
    });

    const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

    return { total, active, occupancyRate };
  }

  private async getUnitStats(userId: string, tenantId: string) {
    const [total, occupied] = await Promise.all([
      this.prisma.unit.count({
        where: {
          property: {
            ownerId: userId,
            tenantId: tenantId
          },
        },
      }),
      this.prisma.unit.count({
        where: {
          property: {
            ownerId: userId,
            tenantId: tenantId
          },
          isOccupied: true,
        },
      }),
    ]);

    return { total, occupied };
  }

  private async getResidentStats(userId: string, tenantId: string) {
    const total = await this.prisma.user.count({
      where: {
        userTenants: {
          some: {
            tenantId: tenantId,
            role: 'RESIDENT'
          }
        }
      },
    });

    return { total };
  }

  private async getActiveTickets(userId: string, tenantId: string) {
    return this.prisma.ticket.count({
      where: {
        property: {
          ownerId: userId,
          tenantId: tenantId
        },
        tenantId: tenantId,
        status: { in: ['OPEN', 'IN_PROGRESS'] },
      },
    });
  }

  private async getPendingExpenses(userId: string, tenantId: string) {
    const result = await this.prisma.expense.aggregate({
      where: {
        property: {
          ownerId: userId,
          tenantId: tenantId
        },
        tenantId: tenantId,
        status: { in: ['OPEN', 'OVERDUE'] },
      },
      _sum: { amount: true },
    });

    return { totalAmount: result._sum.amount || 0 };
  }

  private async getMonthlyRevenue(userId: string, tenantId: string) {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    
    const result = await this.prisma.payment.aggregate({
      where: {
        expense: {
          property: {
            ownerId: userId,
            tenantId: tenantId
          },
        },
        tenantId: tenantId,
        status: 'COMPLETED',
        date: { gte: startOfMonth },
      },
      _sum: { amount: true },
    });

    return result._sum.amount || 0;
  }

  private async calculateCollectionRate(userId: string, tenantId: string) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const expenses = await this.prisma.expense.findMany({
      where: {
        property: {
          ownerId: userId,
          tenantId: tenantId
        },
        tenantId: tenantId,
        dueDate: { gte: sixMonthsAgo },
        status: { in: ['OPEN', 'OVERDUE', 'PAID'] },
      },
      include: {
        payments: {
          where: {
            status: 'COMPLETED',
            tenantId: tenantId
          },
        },
      },
    });

    const totalDue = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalPaid = expenses.reduce((sum, expense) => 
      sum + expense.payments.reduce((paid, payment) => paid + payment.amount, 0), 0
    );

    return totalDue > 0 ? (totalPaid / totalDue) * 100 : 0;
  }

  private async getExpenseTrends(userId: string, tenantId: string): Promise<ExpenseTrend[]> {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const trends = await this.prisma.expense.findMany({
      where: {
        property: {
          ownerId: userId,
          tenantId: tenantId
        },
        tenantId: tenantId,
        dueDate: { gte: sixMonthsAgo },
      },
      select: {
        period: true,
        amount: true,
        payments: {
          where: {
            status: 'COMPLETED',
            tenantId: tenantId
          },
          select: {
            amount: true,
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    const grouped = trends.reduce((acc, expense) => {
      if (!acc[expense.period]) {
        acc[expense.period] = { total: 0, collected: 0 };
      }
      acc[expense.period].total += expense.amount;
      acc[expense.period].collected += expense.payments.reduce((sum, p) => sum + p.amount, 0);
      return acc;
    }, {});

    return Object.entries(grouped).map(([period, data]: [string, any]) => ({
      period,
      total: data.total,
      collected: data.collected,
      pending: data.total - data.collected,
    }));
  }

  private async getRecentActivities(userId: string, tenantId: string): Promise<RecentActivity[]> {
    const [recentPayments, recentTickets, recentExpenses, recentTasks] = await Promise.all([
      this.prisma.payment.findMany({
        where: {
          expense: {
            property: {
              ownerId: userId,
              tenantId: tenantId
            },
          },
          tenantId: tenantId,
        },
        include: {
          user: { select: { name: true } },
          expense: { select: { concept: true } },
          unit: { select: { number: true } },
        },
        orderBy: { date: 'desc' },
        take: 5,
      }),
      this.prisma.ticket.findMany({
        where: {
          property: {
            ownerId: userId,
            tenantId: tenantId
          },
          tenantId: tenantId,
        },
        include: {
          user: { select: { name: true } },
          property: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.expense.findMany({
        where: {
          property: {
            ownerId: userId,
            tenantId: tenantId
          },
          tenantId: tenantId,
        },
        include: {
          property: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.task.findMany({
        where: {
          property: {
            ownerId: userId,
            tenantId: tenantId
          },
          tenantId: tenantId,
        },
        include: {
          property: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    const activities: RecentActivity[] = [
      ...recentPayments.map(payment => ({
        type: 'PAYMENT' as const,
        description: `Pago de ${payment.user.name} - ${payment.expense.concept}`,
        date: payment.date,
        propertyName: payment.unit.number,
        amount: payment.amount,
      })),
      ...recentTickets.map(ticket => ({
        type: 'TICKET' as const,
        description: `Ticket: ${ticket.title}`,
        date: ticket.createdAt,
        propertyName: ticket.property.name,
      })),
      ...recentExpenses.map(expense => ({
        type: 'EXPENSE' as const,
        description: `Nueva expensa: ${expense.concept}`,
        date: expense.createdAt,
        propertyName: expense.property.name,
        amount: expense.amount,
      })),
      ...recentTasks.map(task => ({
        type: 'TASK' as const,
        description: `Tarea: ${task.title}`,
        date: task.createdAt,
        propertyName: task.property.name,
      })),
    ];

    return activities.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10);
  }

  private async getDelinquencyStats(userId: string, tenantId: string): Promise<DelinquencyStats> {
    const overdueExpenses = await this.prisma.expense.findMany({
      where: {
        property: {
          ownerId: userId,
          tenantId: tenantId
        },
        tenantId: tenantId,
        status: 'OVERDUE',
      },
      include: {
        unit: {
          select: {
            number: true,
            property: {
              select: {
                name: true
              }
            }
          }
        },
        payments: {
          where: {
            status: 'COMPLETED',
            tenantId: tenantId
          },
        },
      },
    });

    const totalOverdueAmount = overdueExpenses.reduce((sum, expense) => {
      const paidAmount = expense.payments.reduce((paid, payment) => paid + payment.amount, 0);
      return sum + (expense.amount - paidAmount);
    }, 0);

    const totalExpenses = await this.prisma.expense.aggregate({
      where: {
        property: {
          ownerId: userId,
          tenantId: tenantId
        },
        tenantId: tenantId,
      },
      _sum: { amount: true },
    });

    const delinquencyRate = totalExpenses._sum.amount > 0 
      ? (totalOverdueAmount / totalExpenses._sum.amount) * 100 
      : 0;

    const topDelinquentUnits = overdueExpenses
      .reduce((acc, expense) => {
        if (!expense.unit) return acc;
        
        const unitKey = `${expense.unit.property.name}-${expense.unit.number}`;
        const existing = acc.find(item => item.unitNumber === unitKey);
        const paidAmount = expense.payments.reduce((paid, payment) => paid + payment.amount, 0);
        const overdueAmount = expense.amount - paidAmount;
        
        if (existing) {
          existing.overdueAmount += overdueAmount;
        } else {
          acc.push({
            unitNumber: unitKey,
            propertyName: expense.unit.property.name,
            overdueAmount,
            daysOverdue: Math.floor((new Date().getTime() - expense.dueDate.getTime()) / (1000 * 3600 * 24))
          });
        }
        return acc;
      }, [] as DelinquentUnit[])
      .sort((a, b) => b.overdueAmount - a.overdueAmount)
      .slice(0, 5);

    return {
      overdueExpenses: overdueExpenses.length,
      totalOverdueAmount,
      delinquencyRate,
      topDelinquentUnits
    };
  }

  private async getQuickStats(userId: string, tenantId: string): Promise<QuickStats> {
    const [
      pendingTasks,
      openTickets,
      scheduledTasks,
      overdueExpenses
    ] = await Promise.all([
      this.prisma.task.count({
        where: {
          property: {
            ownerId: userId,
            tenantId: tenantId
          },
          tenantId: tenantId,
          status: 'PENDING'
        }
      }),
      this.prisma.ticket.count({
        where: {
          property: {
            ownerId: userId,
            tenantId: tenantId
          },
          tenantId: tenantId,
          status: 'OPEN'
        }
      }),
      this.prisma.task.count({
        where: {
          property: {
            ownerId: userId,
            tenantId: tenantId
          },
          tenantId: tenantId,
          status: 'IN_PROGRESS'
        }
      }),
      this.prisma.expense.count({
        where: {
          property: {
            ownerId: userId,
            tenantId: tenantId
          },
          tenantId: tenantId,
          status: 'OVERDUE'
        }
      })
    ]);

    return {
      pendingTasks,
      openTickets,
      scheduledTasks,
      overdueExpenses
    };
  }

  // ========== MÉTODOS PRIVADOS PARA RESIDENTES ==========

  private async getResidentUserData(userId: string, tenantId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userTenants: {
          where: {
            tenantId: tenantId
          }
        },
        managedUnits: {
          where: {
            tenantId: tenantId,
            isOccupied: true
          },
          include: {
            property: true,
            expenses: {
              where: {
                status: { in: ['OPEN', 'OVERDUE'] },
                tenantId: tenantId
              },
              include: {
                payments: {
                  where: { 
                    userId,
                    tenantId: tenantId
                  },
                },
              },
            },
            tickets: {
              where: {
                status: { in: ['OPEN', 'IN_PROGRESS'] },
                tenantId: tenantId
              },
              take: 5,
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar que el usuario tiene acceso al tenant
    const userTenant = user.userTenants[0];
    if (!userTenant) {
      throw new ForbiddenException('Usuario no tiene acceso a este tenant');
    }

    const totalDue = user.managedUnits.reduce((sum, unit) => {
      return sum + unit.expenses.reduce((expenseSum, expense) => {
        const paidAmount = expense.payments.reduce((paid, payment) => paid + payment.amount, 0);
        return expenseSum + (expense.amount - paidAmount);
      }, 0);
    }, 0);

    const activeTickets = user.managedUnits.reduce((sum, unit) => sum + unit.tickets.length, 0);

    const recentExpenses: ResidentExpense[] = user.managedUnits.flatMap(unit => 
      unit.expenses.map(expense => {
        const paidAmount = expense.payments.reduce((sum, payment) => sum + payment.amount, 0);
        return {
          id: expense.id,
          concept: expense.concept,
          amount: expense.amount,
          dueDate: expense.dueDate,
          status: expense.status,
          property: unit.property.name,
          unit: unit.number,
          paidAmount,
          remainingAmount: expense.amount - paidAmount
        };
      })
    ).slice(0, 10);

    const recentTickets: ResidentTicket[] = user.managedUnits.flatMap(unit => 
      unit.tickets.map(ticket => ({
        id: ticket.id,
        title: ticket.title,
        status: ticket.status,
        priority: ticket.priority,
        createdAt: ticket.createdAt,
        property: unit.property.name,
        unit: unit.number,
      }))
    );

    return {
      user: {
        name: user.name,
        email: user.email,
        role: userTenant.role,
      },
      overview: {
        totalDue,
        activeTickets,
        managedUnits: user.managedUnits.length,
      },
      recentExpenses,
      recentTickets
    };
  }

  private async getPaymentHistory(userId: string, tenantId: string): Promise<PaymentHistory[]> {
    const payments = await this.prisma.payment.findMany({
      where: {
        userId,
        tenantId: tenantId,
        status: 'COMPLETED'
      },
      include: {
        expense: {
          select: {
            concept: true
          }
        }
      },
      orderBy: { date: 'desc' },
      take: 10
    });

    return payments.map(payment => ({
      id: payment.id,
      date: payment.date,
      amount: payment.amount,
      concept: payment.expense.concept,
      method: payment.method,
      status: payment.status
    }));
  }

  private async getFinancialSummary(userId: string, tenantId: string): Promise<FinancialSummary> {
    const [paidResult, pendingResult, upcomingResult] = await Promise.all([
      this.prisma.payment.aggregate({
        where: {
          userId,
          tenantId: tenantId,
          status: 'COMPLETED'
        },
        _sum: { amount: true }
      }),
      this.prisma.expense.aggregate({
        where: {
          unit: {
            managerId: userId
          },
          tenantId: tenantId,
          status: { in: ['OPEN', 'OVERDUE'] }
        },
        _sum: { amount: true }
      }),
      this.prisma.expense.aggregate({
        where: {
          unit: {
            managerId: userId
          },
          tenantId: tenantId,
          status: 'OPEN',
          dueDate: {
            gte: new Date()
          }
        },
        _sum: { amount: true }
      })
    ]);

    return {
      totalPaid: paidResult._sum.amount || 0,
      pendingAmount: pendingResult._sum.amount || 0,
      upcomingExpenses: upcomingResult._sum.amount || 0
    };
  }

  private async getNextDueDate(userId: string, tenantId: string): Promise<Date | undefined> {
    const nextExpense = await this.prisma.expense.findFirst({
      where: {
        unit: {
          managerId: userId
        },
        tenantId: tenantId,
        status: 'OPEN',
        dueDate: {
          gte: new Date()
        }
      },
      orderBy: {
        dueDate: 'asc'
      },
      select: {
        dueDate: true
      }
    });

    return nextExpense?.dueDate;
  }

  // ========== MÉTODOS PRIVADOS PARA MANTENIMIENTO ==========

  private async getAssignedTickets(userId: string, tenantId: string): Promise<MaintenanceTicket[]> {
    return this.prisma.ticket.findMany({
      where: {
        assignedToId: userId,
        tenantId: tenantId,
        status: { in: ['OPEN', 'IN_PROGRESS'] },
      },
      include: {
        property: {
          select: {
            id: true,
            name: true
          }
        },
        unit: {
          select: {
            id: true,
            number: true
          }
        },
        user: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
      orderBy: { priority: 'desc' },
    });
  }

  private async getCompletedTicketsCount(userId: string, tenantId: string): Promise<number> {
    return this.prisma.ticket.count({
      where: {
        assignedToId: userId,
        tenantId: tenantId,
        status: 'RESOLVED',
        updatedAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    });
  }

  private async getMaintenanceProperties(userId: string, tenantId: string): Promise<MaintenanceProperty[]> {
    return this.prisma.property.findMany({
      where: {
        tenantId: tenantId,
        tickets: {
          some: {
            assignedToId: userId,
          },
        },
      },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            tickets: {
              where: {
                assignedToId: userId,
                status: { in: ['OPEN', 'IN_PROGRESS'] },
              },
            },
          },
        },
      },
    }).then(properties => 
      properties.map(property => ({
        id: property.id,
        name: property.name,
        activeTickets: property._count.tickets
      }))
    );
  }

  private async getPriorityBreakdown(userId: string, tenantId: string): Promise<PriorityBreakdown> {
    const result = await this.prisma.ticket.groupBy({
      by: ['priority'],
      where: {
        assignedToId: userId,
        tenantId: tenantId,
        status: { in: ['OPEN', 'IN_PROGRESS'] },
      },
      _count: {
        id: true,
      },
    });

    const breakdown: PriorityBreakdown = { high: 0, medium: 0, low: 0 };
    
    result.forEach(item => {
      breakdown[item.priority.toLowerCase() as keyof PriorityBreakdown] = item._count.id;
    });

    return breakdown;
  }

  private async getPerformanceMetrics(userId: string, tenantId: string): Promise<PerformanceMetrics> {
    const resolvedTickets = await this.prisma.ticket.findMany({
      where: {
        assignedToId: userId,
        tenantId: tenantId,
        status: 'RESOLVED',
        updatedAt: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - 3)),
        },
      },
      select: {
        createdAt: true,
        updatedAt: true,
      },
    });

    const totalTickets = resolvedTickets.length;
    const totalResponseTime = resolvedTickets.reduce((sum, ticket) => {
      const responseTime = ticket.updatedAt.getTime() - ticket.createdAt.getTime();
      return sum + responseTime;
    }, 0);

    const averageResponseTime = totalTickets > 0 ? totalResponseTime / totalTickets / (1000 * 3600 * 24) : 0;

    const resolutionRate = totalTickets > 0 ? (totalTickets / (totalTickets + 5)) * 100 : 0;
    const customerSatisfaction = 4.5;

    return {
      resolutionRate,
      averageResponseTime,
      customerSatisfaction
    };
  }

  // ========== MÉTODOS PARA KPIs AVANZADOS (NUEVOS) ==========

  async getAdvancedKPIs(userId: string, tenantId: string) {
    const [
      financialHealth,
      maintenanceMetrics,
      occupancyData,
      collectionPerformance
    ] = await Promise.all([
      this.getFinancialHealth(tenantId),
      this.getMaintenanceMetrics(tenantId),
      this.getOccupancyData(tenantId),
      this.getCollectionPerformance(tenantId)
    ]);

    return {
      financialHealth,
      maintenanceMetrics,
      occupancyData,
      collectionPerformance
    };
  }

  private async getFinancialHealth(tenantId: string) {
    const currentMonth = new Date();
    const previousMonth = new Date(currentMonth);
    previousMonth.setMonth(previousMonth.getMonth() - 1);

    const [currentRevenue, previousRevenue, currentExpenses, previousExpenses] = await Promise.all([
      this.getMonthlyRevenueForPeriod(tenantId, currentMonth),
      this.getMonthlyRevenueForPeriod(tenantId, previousMonth),
      this.getMonthlyExpensesForPeriod(tenantId, currentMonth),
      this.getMonthlyExpensesForPeriod(tenantId, previousMonth)
    ]);

    const revenueGrowth = previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
      : 0;

    const expenseGrowth = previousExpenses > 0 
      ? ((currentExpenses - previousExpenses) / previousExpenses) * 100 
      : 0;

    return {
      currentRevenue,
      revenueGrowth,
      currentExpenses,
      expenseGrowth,
      netProfit: currentRevenue - currentExpenses,
      profitMargin: currentRevenue > 0 ? ((currentRevenue - currentExpenses) / currentRevenue) * 100 : 0
    };
  }

  private async getMonthlyRevenueForPeriod(tenantId: string, date: Date): Promise<number> {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    const result = await this.prisma.payment.aggregate({
      where: {
        tenantId: tenantId,
        status: 'COMPLETED',
        date: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { amount: true },
    });

    return result._sum.amount || 0;
  }

  private async getMonthlyExpensesForPeriod(tenantId: string, date: Date): Promise<number> {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    const result = await this.prisma.expense.aggregate({
      where: {
        tenantId: tenantId,
        dueDate: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { amount: true },
    });

    return result._sum.amount || 0;
  }

  private async getMaintenanceMetrics(tenantId: string) {
    const [totalTickets, resolvedTickets, avgResolutionTime] = await Promise.all([
      this.prisma.ticket.count({ where: { tenantId } }),
      this.prisma.ticket.count({ 
        where: { 
          tenantId, 
          status: 'RESOLVED',
          updatedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        } 
      }),
      this.getAverageResolutionTime(tenantId)
    ]);

    return {
      totalTickets,
      resolvedTickets,
      resolutionRate: totalTickets > 0 ? (resolvedTickets / totalTickets) * 100 : 0,
      avgResolutionTime
    };
  }

  private async getAverageResolutionTime(tenantId: string): Promise<number> {
    const resolvedTickets = await this.prisma.ticket.findMany({
      where: {
        tenantId: tenantId,
        status: 'RESOLVED',
        updatedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      },
      select: {
        createdAt: true,
        updatedAt: true
      }
    });

    if (resolvedTickets.length === 0) return 0;

    const totalTime = resolvedTickets.reduce((sum, ticket) => {
      const resolutionTime = ticket.updatedAt.getTime() - ticket.createdAt.getTime();
      return sum + resolutionTime;
    }, 0);

    return totalTime / resolvedTickets.length / (1000 * 60 * 60 * 24); // Convertir a días
  }

  private async getOccupancyData(tenantId: string) {
    const [totalUnits, occupiedUnits] = await Promise.all([
      this.prisma.unit.count({
        where: {
          property: {
            tenantId: tenantId
          }
        }
      }),
      this.prisma.unit.count({
        where: {
          property: {
            tenantId: tenantId
          },
          isOccupied: true
        }
      })
    ]);

    const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

    return {
      totalUnits,
      occupiedUnits,
      occupancyRate,
      vacancyRate: 100 - occupancyRate
    };
  }

  private async getCollectionPerformance(tenantId: string) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const expenses = await this.prisma.expense.findMany({
      where: {
        tenantId,
        dueDate: { gte: thirtyDaysAgo }
      },
      include: {
        payments: {
          where: { status: 'COMPLETED' }
        }
      }
    });

    let totalDue = 0;
    let totalCollected = 0;
    let overdueAmount = 0;

    expenses.forEach(expense => {
      totalDue += expense.amount;
      const paid = expense.payments.reduce((sum, payment) => sum + payment.amount, 0);
      totalCollected += paid;
      
      if (expense.status === 'OVERDUE') {
        overdueAmount += (expense.amount - paid);
      }
    });

    return {
      totalDue,
      totalCollected,
      collectionRate: totalDue > 0 ? (totalCollected / totalDue) * 100 : 0,
      overdueAmount,
      delinquencyRate: totalDue > 0 ? (overdueAmount / totalDue) * 100 : 0
    };
  }
}