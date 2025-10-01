// src/units/units.service.ts - CORREGIDO PARA MULTI-TENANT
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';

@Injectable()
export class UnitsService {
  constructor(private prisma: PrismaService) {}

  async create(createUnitDto: CreateUnitDto & { tenantId: string }, userId: string) {
    // Verificar que la propiedad existe y el usuario es owner en este tenant
    const property = await this.prisma.property.findFirst({
      where: { 
        id: createUnitDto.propertyId, // CAMBIADO: buildingId â†’ propertyId
        ownerId: userId,
        tenantId: createUnitDto.tenantId
      },
    });

    if (!property) {
      throw new ForbiddenException('No tienes permisos para agregar unidades a esta propiedad en este tenant');
    }

    // Si se asigna un manager, verificar que tiene acceso al tenant
    if (createUnitDto.managerId) {
      const managerTenant = await this.prisma.userTenant.findUnique({
        where: {
          userId_tenantId: {
            userId: createUnitDto.managerId,
            tenantId: createUnitDto.tenantId
          }
        }
      });

      if (!managerTenant) {
        throw new ForbiddenException('El manager asignado no tiene acceso a este tenant');
      }
    }

    return this.prisma.unit.create({
      data: {
        number: createUnitDto.number,
        floor: createUnitDto.floor,
        type: createUnitDto.type,
        area: createUnitDto.area,
        bedrooms: createUnitDto.bedrooms,
        bathrooms: createUnitDto.bathrooms,
        isOccupied: createUnitDto.isOccupied || false,
        features: createUnitDto.features || [],
        propertyId: createUnitDto.propertyId, // CAMBIADO: buildingId â†’ propertyId
        tenantId: createUnitDto.tenantId, // AGREGADO: tenantId
        managerId: createUnitDto.managerId,
      },
      include: {
        property: { // CAMBIADO: building â†’ property
          select: {
            id: true,
            name: true,
            address: true
          }
        },
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findAll(propertyId: string, userId: string, tenantId: string) {
    // Verificar permisos de la propiedad en este tenant
    const property = await this.prisma.property.findFirst({
      where: { 
        id: propertyId,
        tenantId: tenantId,
        OR: [
          { ownerId: userId },
          { units: { some: { managerId: userId } } }
        ]
      },
    });

    if (!property) {
      throw new ForbiddenException('No tienes permisos para ver las unidades de esta propiedad en este tenant');
    }

    return this.prisma.unit.findMany({
      where: { 
        propertyId,
        tenantId // AGREGADO: filtrar por tenant
      },
      include: {
        property: { // CAMBIADO: building â†’ property
          select: {
            id: true,
            name: true,
            address: true
          }
        },
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            expenses: {
              where: { tenantId: tenantId }
            },
            payments: {
              where: { tenantId: tenantId }
            },
            tickets: {
              where: { tenantId: tenantId }
            },
          },
        },
      },
      orderBy: { floor: 'asc' },
    });
  }

  async findOne(id: string, userId: string, tenantId: string) {
    const unit = await this.prisma.unit.findFirst({
      where: { 
        id,
        tenantId, // AGREGADO: filtrar por tenant
        OR: [
          { property: { ownerId: userId, tenantId: tenantId } },
          { managerId: userId },
          { property: { ownerId: userId, tenantId: tenantId } }
        ]
      },
      include: {
        property: { // CAMBIADO: building â†’ property
          select: {
            id: true,
            name: true,
            address: true
          }
        },
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        expenses: {
          where: { tenantId: tenantId },
          take: 5,
          orderBy: { dueDate: 'desc' },
        },
        payments: {
          where: { tenantId: tenantId },
          take: 10,
          orderBy: { date: 'desc' },
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
        },
        tickets: {
          where: { tenantId: tenantId },
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!unit) {
      throw new NotFoundException('Unit not found or no access in this tenant');
    }

    return unit;
  }

  async update(id: string, updateUnitDto: UpdateUnitDto, userId: string, tenantId: string) {
    await this.verifyUnitAccess(id, userId, tenantId);

    // Si se cambia el manager, verificar que tiene acceso al tenant
    if (updateUnitDto.managerId) {
      const managerTenant = await this.prisma.userTenant.findUnique({
        where: {
          userId_tenantId: {
            userId: updateUnitDto.managerId,
            tenantId: tenantId
          }
        }
      });

      if (!managerTenant) {
        throw new ForbiddenException('El manager asignado no tiene acceso a este tenant');
      }
    }

    return this.prisma.unit.update({
      where: { id },
      data: {
        number: updateUnitDto.number,
        floor: updateUnitDto.floor,
        type: updateUnitDto.type,
        area: updateUnitDto.area,
        bedrooms: updateUnitDto.bedrooms,
        bathrooms: updateUnitDto.bathrooms,
        isOccupied: updateUnitDto.isOccupied,
        features: updateUnitDto.features || undefined,
        managerId: updateUnitDto.managerId,
      },
      include: {
        property: { // CAMBIADO: building â†’ property
          select: {
            id: true,
            name: true,
            address: true
          }
        },
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string, tenantId: string) {
    await this.verifyUnitAccess(id, userId, tenantId);

    return this.prisma.unit.delete({
      where: { id },
    });
  }

  async getUnitStats(id: string, userId: string, tenantId: string) {
    await this.verifyUnitAccess(id, userId, tenantId);

    const [currentExpenses, paymentHistory, activeTickets] = await Promise.all([
      this.prisma.expense.findMany({
        where: {
          unitId: id,
          tenantId: tenantId,
          status: { in: ['OPEN', 'OVERDUE'] },
        },
        include: {
          payments: {
            where: {
              unitId: id,
              tenantId: tenantId,
            },
          },
        },
      }),
      this.prisma.payment.findMany({
        where: {
          unitId: id,
          tenantId: tenantId,
          status: 'COMPLETED',
        },
        orderBy: { date: 'desc' },
        take: 6,
      }),
      this.prisma.ticket.count({
        where: {
          unitId: id,
          tenantId: tenantId,
          status: { in: ['OPEN', 'IN_PROGRESS'] },
        },
      }),
    ]);

    const totalDue = currentExpenses.reduce((sum, expense) => {
      const paidAmount = expense.payments.reduce((paid, payment) => paid + payment.amount, 0);
      return sum + (expense.amount - paidAmount);
    }, 0);

    return {
      totalDue,
      activeTickets,
      paymentHistory,
      currentExpenses: currentExpenses.map(expense => ({
        ...expense,
        paidAmount: expense.payments.reduce((sum, payment) => sum + payment.amount, 0),
        remaining: expense.amount - expense.payments.reduce((sum, payment) => sum + payment.amount, 0),
      })),
    };
  }

  private async verifyUnitAccess(unitId: string, userId: string, tenantId: string) {
    const unit = await this.prisma.unit.findFirst({
      where: { 
        id: unitId,
        tenantId: tenantId,
        property: { 
          ownerId: userId,
          tenantId: tenantId
        }
      },
    });

    if (!unit) {
      throw new ForbiddenException('No tienes permisos para modificar esta unidad en este tenant');
    }

    return unit;
  }
}
