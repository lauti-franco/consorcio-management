// src/buildings/buildings.service.ts
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class BuildingsService {
  constructor(private prisma: PrismaService) {}

  async create(createBuildingDto: CreateBuildingDto & { tenantId: string; ownerId: string }) {
    // Verificar que el tenant existe y está activo
    const tenant = await this.prisma.tenant.findUnique({
      where: { 
        id: createBuildingDto.tenantId,
        isActive: true 
      }
    });

    if (!tenant) {
      throw new BadRequestException('Tenant not found or inactive');
    }

    // Verificar que el usuario tiene acceso al tenant
    const userTenant = await this.prisma.userTenant.findUnique({
      where: {
        userId_tenantId: {
          userId: createBuildingDto.ownerId,
          tenantId: createBuildingDto.tenantId
        }
      }
    });

    if (!userTenant) {
      throw new ForbiddenException('User does not have access to this tenant');
    }

    // Verificar límite de propiedades según suscripción
    const userSubscription = await this.prisma.subscription.findUnique({
      where: { userId: createBuildingDto.ownerId },
    });

    const propertyCount = await this.prisma.property.count({
      where: { 
        tenantId: createBuildingDto.tenantId,
        ownerId: createBuildingDto.ownerId 
      },
    });

    if (userSubscription && propertyCount >= userSubscription.maxProperties) {
      throw new ForbiddenException(
        `Límite de propiedades alcanzado. Tu plan permite máximo ${userSubscription.maxProperties} propiedades.`
      );
    }

    // Crear la propiedad (building) con tenantId
    return this.prisma.property.create({
      data: {
        name: createBuildingDto.name,
        address: createBuildingDto.address,
        city: createBuildingDto.city,
        ownerId: createBuildingDto.ownerId,
        tenantId: createBuildingDto.tenantId,
        settings: createBuildingDto.settings || {
          currency: 'ARS',
          language: 'es',
          expenseCalculation: 'area_based'
        }
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        tenant: {
          select: {
            id: true,
            name: true,
          }
        }
      },
    });
  }

  async findAllByTenant(tenantId: string) {
    // Obtener todas las propiedades del tenant
    return this.prisma.property.findMany({
      where: { 
        tenantId,
        isActive: true 
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            units: true,
            expenses: true,
            tickets: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    // Verificar que la propiedad pertenece al tenant
    const property = await this.prisma.property.findFirst({
      where: { 
        id,
        tenantId,
        isActive: true 
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        units: {
          where: { isOccupied: true },
          include: {
            manager: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
          orderBy: { floor: 'asc' },
        },
        _count: {
          select: {
            units: true,
            expenses: true,
            tickets: true,
          },
        },
      },
    });

    if (!property) {
      throw new NotFoundException('Property not found in this tenant');
    }

    return property;
  }

  async update(id: string, updateBuildingDto: UpdateBuildingDto, tenantId: string) {
    // Verificar que la propiedad existe y pertenece al tenant
    await this.verifyPropertyExists(id, tenantId);

    try {
      return await this.prisma.property.update({
        where: { id },
        data: updateBuildingDto,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          tenant: {
            select: {
              id: true,
              name: true,
            }
          }
        },
      });
    } catch {
      throw new NotFoundException('Property not found');
    }
  }

  async remove(id: string, tenantId: string) {
    // Verificar que la propiedad existe y pertenece al tenant
    await this.verifyPropertyExists(id, tenantId);

    try {
      // Soft delete - marcar como inactivo
      return await this.prisma.property.update({
        where: { id },
        data: { isActive: false },
      });
    } catch {
      throw new NotFoundException('Property not found');
    }
  }

  async getPropertyStats(id: string, tenantId: string) {
    // Verificar que la propiedad pertenece al tenant
    await this.verifyPropertyExists(id, tenantId);

    const [
      totalUnits,
      occupiedUnits,
      activeTickets,
      pendingExpenses,
      monthlyRevenue,
      totalResidents,
    ] = await Promise.all([
      this.prisma.unit.count({ 
        where: { 
          propertyId: id,
          isOccupied: true 
        } 
      }),
      this.prisma.unit.count({ 
        where: { 
          propertyId: id, 
          isOccupied: true, 
        } 
      }),
      this.prisma.ticket.count({ 
        where: { 
          propertyId: id, 
          status: { in: ['OPEN', 'IN_PROGRESS'] } 
        } 
      }),
      this.prisma.expense.aggregate({
        where: { 
          propertyId: id, 
          status: { in: ['OPEN', 'OVERDUE'] } 
        },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: { 
          expense: { propertyId: id },
          status: 'COMPLETED',
          date: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
        _sum: { amount: true },
      }),
      this.prisma.user.count({
        where: {
          managedUnits: {
            some: {
              propertyId: id,
              isOccupied: true
            },
          },
          role: 'RESIDENT',
        },
      }),
    ]);

    return {
      totalUnits,
      occupiedUnits,
      activeTickets,
      pendingExpenses: pendingExpenses._sum.amount || 0,
      monthlyRevenue: monthlyRevenue._sum.amount || 0,
      totalResidents,
      occupancyRate: totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0,
    };
  }

  private async verifyPropertyExists(propertyId: string, tenantId: string) {
    const property = await this.prisma.property.findFirst({
      where: { 
        id: propertyId, 
        tenantId,
        isActive: true 
      },
    });

    if (!property) {
      throw new NotFoundException('Property not found in this tenant');
    }

    return property;
  }

  // Método para verificar acceso basado en roles de tenant (opcional)
  async verifyPropertyAccess(propertyId: string, userId: string, userRole: UserRole, tenantId: string) {
    if (userRole === UserRole.SUPER_ADMIN) {
      return true; // Super admin tiene acceso a todo
    }

    const property = await this.prisma.property.findFirst({
      where: {
        id: propertyId,
        tenantId,
        isActive: true,
        OR: [
          { ownerId: userId }, // Propietario
          { units: { some: { managerId: userId } } }, // Manager de unidad
          { tickets: { some: { assignedToId: userId } } }, // Técnico asignado
        ],
      },
    });

    if (!property) {
      throw new ForbiddenException('No tienes acceso a esta propiedad en este tenant');
    }

    return property;
  }
}