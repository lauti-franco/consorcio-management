// src/expenses/expenses.service.ts - CORREGIDO PARA MULTI-TENANT
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { UserRole } from '@prisma/client'; // CAMBIADO: usar enum de Prisma

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  async create(createExpenseDto: CreateExpenseDto & { tenantId: string }, userId: string) {
    // Verificar que el usuario tiene permisos de ADMIN en este tenant
    const userTenant = await this.prisma.userTenant.findUnique({
      where: {
        userId_tenantId: {
          userId: userId,
          tenantId: createExpenseDto.tenantId
        }
      }
    });

    if (!userTenant || userTenant.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can create expenses in this tenant');
    }

    // Verificar que la propiedad pertenece al tenant
    const property = await this.prisma.property.findFirst({
      where: { 
        id: createExpenseDto.propertyId,
        tenantId: createExpenseDto.tenantId 
      }
    });

    if (!property) {
      throw new ForbiddenException('Property not found in this tenant');
    }

    // Si hay unitId, verificar que la unidad pertenece a la propiedad y al tenant
    if (createExpenseDto.unitId) {
      const unit = await this.prisma.unit.findFirst({
        where: { 
          id: createExpenseDto.unitId,
          propertyId: createExpenseDto.propertyId,
          tenantId: createExpenseDto.tenantId
        }
      });

      if (!unit) {
        throw new ForbiddenException('Unit not found in this property and tenant');
      }
    }

    return this.prisma.expense.create({
      data: {
        concept: createExpenseDto.concept,
        amount: createExpenseDto.amount,
        dueDate: new Date(createExpenseDto.dueDate),
        period: createExpenseDto.period,
        type: createExpenseDto.type,
        status: createExpenseDto.status || 'OPEN',
        propertyId: createExpenseDto.propertyId, // CAMBIADO: buildingId → propertyId
        unitId: createExpenseDto.unitId,
        userId: userId,
        tenantId: createExpenseDto.tenantId, // AGREGADO: tenantId
      },
      include: {
        property: { // CAMBIADO: building → property
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
        payments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async findAll(userId: string, userRole: UserRole, tenantId: string, propertyId?: string) {
    const where: any = { tenantId }; // AGREGADO: siempre filtrar por tenant

    // Filtrar por propiedad si se especifica
    if (propertyId) {
      where.propertyId = propertyId;
    }

    // Para residentes, solo ver expensas de sus unidades
    if (userRole === UserRole.RESIDENT) {
      const userUnits = await this.prisma.unit.findMany({
        where: {
          managerId: userId,
          tenantId: tenantId
        },
        select: { id: true }
      });

      where.unitId = {
        in: userUnits.map(unit => unit.id)
      };
    }

    // Para mantenimiento, ver expensas de propiedades donde tienen tickets
    if (userRole === UserRole.MAINTENANCE) {
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

      where.propertyId = {
        in: maintenanceProperties.map(prop => prop.id)
      };
    }

    return this.prisma.expense.findMany({
      where,
      include: {
        property: { // CAMBIADO: building → property
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
        payments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        dueDate: 'desc',
      },
    });
  }

  async findOne(id: string, userId: string, userRole: UserRole, tenantId: string) {
    const expense = await this.prisma.expense.findFirst({
      where: { 
        id,
        tenantId // AGREGADO: filtrar por tenant
      },
      include: {
        property: { // CAMBIADO: building → property
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
        payments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found in this tenant');
    }

    // Verificar permisos según el rol
    if (userRole === UserRole.RESIDENT) {
      const userUnit = await this.prisma.unit.findFirst({
        where: {
          id: expense.unitId,
          managerId: userId,
          tenantId: tenantId
        }
      });

      if (!userUnit) {
        throw new ForbiddenException('Access denied to this expense');
      }
    }

    return expense;
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto, userId: string, tenantId: string) {
    // Verificar que el usuario es ADMIN en este tenant
    const userTenant = await this.prisma.userTenant.findUnique({
      where: {
        userId_tenantId: {
          userId: userId,
          tenantId: tenantId
        }
      }
    });

    if (!userTenant || userTenant.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can update expenses in this tenant');
    }

    // Verificar que la expensa existe en este tenant
    const existingExpense = await this.prisma.expense.findFirst({
      where: { 
        id,
        tenantId 
      }
    });

    if (!existingExpense) {
      throw new NotFoundException('Expense not found in this tenant');
    }

    try {
      return await this.prisma.expense.update({
        where: { id },
        data: updateExpenseDto,
        include: {
          property: { // CAMBIADO: building → property
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
          payments: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });
    } catch {
      throw new NotFoundException('Expense not found');
    }
  }

  async remove(id: string, userId: string, tenantId: string) {
    // Verificar que el usuario es ADMIN en este tenant
    const userTenant = await this.prisma.userTenant.findUnique({
      where: {
        userId_tenantId: {
          userId: userId,
          tenantId: tenantId
        }
      }
    });

    if (!userTenant || userTenant.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can delete expenses in this tenant');
    }

    // Verificar que la expensa existe en este tenant
    const existingExpense = await this.prisma.expense.findFirst({
      where: { 
        id,
        tenantId 
      }
    });

    if (!existingExpense) {
      throw new NotFoundException('Expense not found in this tenant');
    }

    try {
      return await this.prisma.expense.delete({
        where: { id },
      });
    } catch {
      throw new NotFoundException('Expense not found');
    }
  }

  async getStats(tenantId: string, propertyId?: string) {
    const where: any = { tenantId }; // AGREGADO: filtrar por tenant

    if (propertyId) {
      where.propertyId = propertyId;
    }

    const total = await this.prisma.expense.count({ where });
    const open = await this.prisma.expense.count({ where: { ...where, status: 'OPEN' } });
    const paid = await this.prisma.expense.count({ where: { ...where, status: 'PAID' } });
    const overdue = await this.prisma.expense.count({ where: { ...where, status: 'OVERDUE' } });

    const totalAmount = await this.prisma.expense.aggregate({
      where,
      _sum: { amount: true },
    });

    const paidAmount = await this.prisma.expense.aggregate({
      where: { ...where, status: 'PAID' },
      _sum: { amount: true },
    });

    return {
      total,
      open,
      paid,
      overdue,
      totalAmount: totalAmount._sum.amount || 0,
      paidAmount: paidAmount._sum.amount || 0,
      pendingAmount: (totalAmount._sum.amount || 0) - (paidAmount._sum.amount || 0),
    };
  }
}