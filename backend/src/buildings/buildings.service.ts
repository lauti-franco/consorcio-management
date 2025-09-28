import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';

@Injectable()
export class BuildingsService {
  constructor(private prisma: PrismaService) {}

  async create(createBuildingDto: CreateBuildingDto, userId: string) {
    // Verificar límite de suscripción
    const userSubscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    const buildingCount = await this.prisma.building.count({
      where: { ownerId: userId },
    });

    if (userSubscription && buildingCount >= userSubscription.maxBuildings) {
      throw new ForbiddenException(
        `Límite de edificios alcanzado. Tu plan permite máximo ${userSubscription.maxBuildings} edificios.`
      );
    }

    return this.prisma.building.create({
      data: {
        name: createBuildingDto.name,
        address: createBuildingDto.address,
        city: createBuildingDto.city,
        ownerId: userId,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findAll(userId: string, userRole: string) {
    let whereCondition = {};
    
    // Filtrar según el rol del usuario
    if (userRole === 'RESIDENT') {
      // Residentes solo ven edificios donde tienen unidades asignadas
      whereCondition = {
        units: {
          some: {
            managerId: userId,
          },
        },
      };
    } else if (userRole === 'MAINTENANCE') {
      // Personal de mantenimiento ve edificios donde tienen tickets asignados
      whereCondition = {
        tickets: {
          some: {
            assignedToId: userId,
          },
        },
      };
    } else if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
      // Admins y super admins ven todos sus edificios
      whereCondition = { ownerId: userId };
    } else {
      // Por defecto, solo edificios del usuario
      whereCondition = { ownerId: userId };
    }

    return this.prisma.building.findMany({
      where: whereCondition,
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

  async findOne(id: string, userId: string, userRole: string) {
    // Verificar permisos de acceso al edificio
    await this.verifyBuildingAccess(id, userId, userRole);

    const building = await this.prisma.building.findUnique({
      where: { id },
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

    if (!building) {
      throw new NotFoundException('Building not found');
    }

    return building;
  }

  async update(id: string, updateBuildingDto: UpdateBuildingDto, userId: string) {
    // Verificar que el usuario es el propietario
    await this.verifyBuildingOwnership(id, userId);

    try {
      return await this.prisma.building.update({
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
        },
      });
    } catch {
      throw new NotFoundException('Building not found');
    }
  }

  async remove(id: string, userId: string) {
    // Verificar que el usuario es el propietario
    await this.verifyBuildingOwnership(id, userId);

    try {
      // Soft delete - marcar como inactivo en lugar de eliminar
      return await this.prisma.building.update({
        where: { id },
        data: { isActive: false },
      });
    } catch {
      throw new NotFoundException('Building not found');
    }
  }

  async getBuildingStats(id: string, userId: string, userRole: string) {
    await this.verifyBuildingAccess(id, userId, userRole);

    const [
      totalUnits,
      occupiedUnits,
      activeTickets,
      pendingExpenses,
      monthlyRevenue,
      totalResidents,
    ] = await Promise.all([
      this.prisma.unit.count({ where: { buildingId: id } }),
      this.prisma.unit.count({ where: { buildingId: id, isOccupied: true } }),
      this.prisma.ticket.count({ 
        where: { 
          buildingId: id, 
          status: { in: ['OPEN', 'IN_PROGRESS'] } 
        } 
      }),
      this.prisma.expense.aggregate({
        where: { 
          buildingId: id, 
          status: { in: ['OPEN', 'OVERDUE'] } 
        },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: { 
          expense: { buildingId: id },
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
              buildingId: id,
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

  private async verifyBuildingAccess(buildingId: string, userId: string, userRole: string) {
    if (userRole === 'SUPER_ADMIN') {
      return true; // Super admin tiene acceso a todo
    }

    const building = await this.prisma.building.findFirst({
      where: {
        id: buildingId,
        OR: [
          { ownerId: userId }, // Propietario
          { units: { some: { managerId: userId } } }, // Manager de unidad
          { tickets: { some: { assignedToId: userId } } }, // Técnico asignado
        ],
      },
    });

    if (!building) {
      throw new ForbiddenException('No tienes acceso a este edificio');
    }

    return building;
  }

  private async verifyBuildingOwnership(buildingId: string, userId: string) {
    const building = await this.prisma.building.findFirst({
      where: { id: buildingId, ownerId: userId },
    });

    if (!building) {
      throw new ForbiddenException('No eres el propietario de este edificio');
    }

    return building;
  }
}