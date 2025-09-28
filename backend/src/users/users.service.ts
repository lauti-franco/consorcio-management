import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(currentUserId: string, currentUserRole: UserRole, role?: UserRole, buildingId?: string) {
    const where: any = {};
    
    if (role) {
      where.role = role;
    }
    
    // Filtrar según permisos del usuario actual
    if (currentUserRole === UserRole.RESIDENT) {
      // Residentes solo pueden ver usuarios de sus mismas unidades/edificios
      where.managedUnits = {
        some: {
          building: {
            units: {
              some: {
                managerId: currentUserId,
              },
            },
          },
        },
      };
    } else if (currentUserRole === UserRole.ADMIN) {
      // Admins ven usuarios de sus edificios
      where.OR = [
        { ownedBuildings: { some: { ownerId: currentUserId } } }, // Dueños de edificios
        { managedUnits: { some: { building: { ownerId: currentUserId } } } }, // Managers de unidades
      ];
    }
    // SUPER_ADMIN puede ver todos los usuarios

    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        avatar: true,
        isActive: true,
        emailVerified: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        subscription: {
          select: {
            plan: true,
            status: true,
            currentPeriodEnd: true,
          },
        },
        ownedBuildings: {
          select: {
            id: true,
            name: true,
          },
        },
        managedUnits: {
          select: {
            id: true,
            number: true,
            building: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async findOne(id: string, currentUserId: string, currentUserRole: UserRole) {
    // Verificar permisos de acceso primero
    await this.verifyUserAccess(id, currentUserId, currentUserRole);

    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        avatar: true,
        isActive: true,
        emailVerified: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        subscription: {
          select: {
            id: true,
            plan: true,
            status: true,
            currentPeriodStart: true,
            currentPeriodEnd: true,
            features: true,
          },
        },
        ownedBuildings: {
          select: {
            id: true,
            name: true,
            address: true,
            _count: {
              select: {
                units: true,
                expenses: true,
                tickets: true,
              },
            },
          },
        },
        managedUnits: {
          select: {
            id: true,
            number: true,
            floor: true,
            type: true,
            area: true,
            building: {
              select: {
                id: true,
                name: true,
                address: true,
              },
            },
            _count: {
              select: {
                expenses: true,
                payments: true,
                tickets: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, updateData: any, currentUserId: string, currentUserRole: UserRole) {
    // Verificar permisos de acceso
    await this.verifyUserAccess(id, currentUserId, currentUserRole);

    try {
      return await this.prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          avatar: true,
          isActive: true,
          emailVerified: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch {
      throw new NotFoundException('User not found');
    }
  }

  async deactivate(id: string, currentUserId: string, currentUserRole: UserRole) {
    // No permitir desactivarse a sí mismo
    if (id === currentUserId) {
      throw new ForbiddenException('No puedes desactivar tu propia cuenta');
    }

    // Verificar permisos de acceso
    await this.verifyUserAccess(id, currentUserId, currentUserRole);

    try {
      return await this.prisma.user.update({
        where: { id },
        data: { isActive: false },
        select: {
          id: true,
          name: true,
          email: true,
          isActive: true,
        },
      });
    } catch {
      throw new NotFoundException('User not found');
    }
  }

  async remove(id: string, currentUserId: string, currentUserRole: UserRole) {
    // No permitir eliminarse a sí mismo
    if (id === currentUserId) {
      throw new ForbiddenException('No puedes eliminar tu propia cuenta');
    }

    // Solo SUPER_ADMIN puede eliminar usuarios
    if (currentUserRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Solo los super administradores pueden eliminar usuarios');
    }

    // Verificar permisos de acceso
    await this.verifyUserAccess(id, currentUserId, currentUserRole);

    try {
      return await this.prisma.user.delete({
        where: { id },
      });
    } catch {
      throw new NotFoundException('User not found');
    }
  }

  async getUserStats(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        ownedBuildings: {
          include: {
            _count: {
              select: {
                units: true,
                expenses: true,
                tickets: true,
              },
            },
          },
        },
        managedUnits: {
          include: {
            _count: {
              select: {
                expenses: true,
                payments: true,
                tickets: true,
              },
            },
          },
        },
        _count: {
          select: {
            ownedBuildings: true,
            managedUnits: true,
            createdTasks: true,
            assignedTasks: true,
            tickets: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      stats: {
        ownedBuildings: user._count.ownedBuildings,
        managedUnits: user._count.managedUnits,
        createdTasks: user._count.createdTasks,
        assignedTasks: user._count.assignedTasks,
        tickets: user._count.tickets,
      },
      buildings: user.ownedBuildings.map(building => ({
        id: building.id,
        name: building.name,
        units: building._count.units,
        expenses: building._count.expenses,
        tickets: building._count.tickets,
      })),
    };
  }

  private async verifyUserAccess(targetUserId: string, currentUserId: string, currentUserRole: UserRole) {
    if (currentUserRole === UserRole.SUPER_ADMIN) {
      return true; // SUPER_ADMIN tiene acceso completo
    }

    if (currentUserRole === UserRole.ADMIN) {
      // Admins solo pueden acceder a usuarios de sus edificios
      const userAccess = await this.prisma.user.findFirst({
        where: {
          id: targetUserId,
          OR: [
            { ownedBuildings: { some: { ownerId: currentUserId } } },
            { managedUnits: { some: { building: { ownerId: currentUserId } } } },
          ],
        },
      });

      if (!userAccess) {
        throw new ForbiddenException('No tienes permisos para acceder a este usuario');
      }
      return true;
    }

    if (currentUserRole === UserRole.RESIDENT) {
      // Residentes solo pueden acceder a su propia información
      if (targetUserId !== currentUserId) {
        throw new ForbiddenException('Solo puedes acceder a tu propia información');
      }
      return true;
    }

    throw new ForbiddenException('Access denied');
  }
}