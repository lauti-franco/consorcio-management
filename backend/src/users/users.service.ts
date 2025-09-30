// src/users/users.service.ts - CORREGIDO PARA MULTI-TENANT
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(currentUserId: string, currentUserRole: UserRole, tenantId: string, role?: UserRole, propertyId?: string) {
    const where: any = {};
    
    if (role) {
      where.role = role;
    }
    
    // Filtrar según permisos del usuario actual en este tenant
    if (currentUserRole === UserRole.RESIDENT) {
      // Residentes solo pueden ver usuarios de sus mismas unidades/propiedades en este tenant
      where.userTenants = {
        some: {
          tenantId: tenantId,
          role: UserRole.RESIDENT
        }
      };
      where.managedUnits = {
        some: {
          property: { // CAMBIADO: building → property
            units: {
              some: {
                managerId: currentUserId,
              },
            },
          },
          tenantId: tenantId
        },
      };
    } else if (currentUserRole === UserRole.ADMIN) {
      // Admins ven usuarios de sus propiedades en este tenant
      where.userTenants = {
        some: {
          tenantId: tenantId
        }
      };
      where.OR = [
        { ownedProperties: { some: { ownerId: currentUserId, tenantId: tenantId } } }, // CAMBIADO: ownedBuildings → ownedProperties
        { managedUnits: { some: { property: { ownerId: currentUserId, tenantId: tenantId } } } }, // CAMBIADO: building → property
      ];
    } else if (currentUserRole === UserRole.MAINTENANCE) {
      // Personal de mantenimiento ve usuarios del mismo tenant
      where.userTenants = {
        some: {
          tenantId: tenantId
        }
      };
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
        ownedProperties: { // CAMBIADO: ownedBuildings → ownedProperties
          where: { tenantId: tenantId },
          select: {
            id: true,
            name: true,
          },
        },
        managedUnits: {
          where: { tenantId: tenantId },
          select: {
            id: true,
            number: true,
            property: { // CAMBIADO: building → property
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        userTenants: {
          where: { tenantId: tenantId },
          select: {
            role: true,
            tenant: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
    });
  }

  async findOne(id: string, currentUserId: string, currentUserRole: UserRole, tenantId: string) {
    // Verificar permisos de acceso primero
    await this.verifyUserAccess(id, currentUserId, currentUserRole, tenantId);

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
        ownedProperties: { // CAMBIADO: ownedBuildings → ownedProperties
          where: { tenantId: tenantId },
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
          where: { tenantId: tenantId },
          select: {
            id: true,
            number: true,
            floor: true,
            type: true,
            area: true,
            property: { // CAMBIADO: building → property
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
        userTenants: {
          where: { tenantId: tenantId },
          select: {
            role: true,
            tenant: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, updateData: any, currentUserId: string, currentUserRole: UserRole, tenantId: string) {
    // Verificar permisos de acceso
    await this.verifyUserAccess(id, currentUserId, currentUserRole, tenantId);

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

  async deactivate(id: string, currentUserId: string, currentUserRole: UserRole, tenantId: string) {
    // No permitir desactivarse a sí mismo
    if (id === currentUserId) {
      throw new ForbiddenException('No puedes desactivar tu propia cuenta');
    }

    // Verificar permisos de acceso
    await this.verifyUserAccess(id, currentUserId, currentUserRole, tenantId);

    try {
      // Solo desactivar del tenant específico, no globalmente
      await this.prisma.userTenant.update({
        where: {
          userId_tenantId: {
            userId: id,
            tenantId: tenantId
          }
        },
        data: { role: UserRole.RESIDENT } // O podríamos eliminar la relación
      });

      return { 
        message: 'Usuario desactivado del tenant exitosamente',
        userId: id,
        tenantId: tenantId
      };
    } catch {
      throw new NotFoundException('User not found in this tenant');
    }
  }

  async remove(id: string, currentUserId: string, currentUserRole: UserRole, tenantId: string) {
    // No permitir eliminarse a sí mismo
    if (id === currentUserId) {
      throw new ForbiddenException('No puedes eliminar tu propia cuenta');
    }

    // Solo SUPER_ADMIN puede eliminar usuarios del tenant
    if (currentUserRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Solo los super administradores pueden eliminar usuarios del tenant');
    }

    // Verificar permisos de acceso
    await this.verifyUserAccess(id, currentUserId, currentUserRole, tenantId);

    try {
      // Solo eliminar la relación con el tenant, no el usuario global
      return await this.prisma.userTenant.delete({
        where: {
          userId_tenantId: {
            userId: id,
            tenantId: tenantId
          }
        }
      });
    } catch {
      throw new NotFoundException('User not found in this tenant');
    }
  }

  async getUserStats(userId: string, tenantId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        ownedProperties: { // CAMBIADO: ownedBuildings → ownedProperties
          where: { tenantId: tenantId },
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
          where: { tenantId: tenantId },
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
            ownedProperties: {
              where: { tenantId: tenantId }
            },
            managedUnits: {
              where: { tenantId: tenantId }
            },
            createdTasks: {
              where: { tenantId: tenantId }
            },
            assignedTasks: {
              where: { tenantId: tenantId }
            },
            tickets: {
              where: { tenantId: tenantId }
            },
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
        ownedProperties: user._count.ownedProperties, // CAMBIADO: ownedBuildings → ownedProperties
        managedUnits: user._count.managedUnits,
        createdTasks: user._count.createdTasks,
        assignedTasks: user._count.assignedTasks,
        tickets: user._count.tickets,
      },
      properties: user.ownedProperties.map(property => ({ // CAMBIADO: buildings → properties
        id: property.id,
        name: property.name,
        units: property._count.units,
        expenses: property._count.expenses,
        tickets: property._count.tickets,
      })),
    };
  }

  private async verifyUserAccess(targetUserId: string, currentUserId: string, currentUserRole: UserRole, tenantId: string) {
    if (currentUserRole === UserRole.SUPER_ADMIN) {
      return true; // SUPER_ADMIN tiene acceso completo
    }

    // Verificar que el usuario objetivo tiene acceso al tenant
    const targetUserTenant = await this.prisma.userTenant.findUnique({
      where: {
        userId_tenantId: {
          userId: targetUserId,
          tenantId: tenantId
        }
      }
    });

    if (!targetUserTenant) {
      throw new ForbiddenException('El usuario no tiene acceso a este tenant');
    }

    if (currentUserRole === UserRole.ADMIN) {
      // Admins solo pueden acceder a usuarios de sus propiedades en este tenant
      const userAccess = await this.prisma.user.findFirst({
        where: {
          id: targetUserId,
          userTenants: {
            some: {
              tenantId: tenantId
            }
          },
          OR: [
            { ownedProperties: { some: { ownerId: currentUserId, tenantId: tenantId } } }, // CAMBIADO: ownedBuildings → ownedProperties
            { managedUnits: { some: { property: { ownerId: currentUserId, tenantId: tenantId } } } }, // CAMBIADO: building → property
          ],
        },
      });

      if (!userAccess) {
        throw new ForbiddenException('No tienes permisos para acceder a este usuario en este tenant');
      }
      return true;
    }

    if (currentUserRole === UserRole.RESIDENT) {
      // Residentes solo pueden acceder a su propia información en este tenant
      if (targetUserId !== currentUserId) {
        throw new ForbiddenException('Solo puedes acceder a tu propia información en este tenant');
      }
      return true;
    }

    if (currentUserRole === UserRole.MAINTENANCE) {
      // Personal de mantenimiento solo puede acceder a su propia información
      if (targetUserId !== currentUserId) {
        throw new ForbiddenException('Solo puedes acceder a tu propia información');
      }
      return true;
    }

    throw new ForbiddenException('Access denied');
  }
}