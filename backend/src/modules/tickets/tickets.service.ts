// src/tickets/tickets.service.ts - CORREGIDO PARA MULTI-TENANT
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { UserRole, TicketStatus, Priority } from '@prisma/client';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  async create(createTicketDto: CreateTicketDto & { tenantId: string }, userId: string) {
    // Verificar que la propiedad existe en el tenant
    const property = await this.prisma.property.findFirst({
      where: { 
        id: createTicketDto.propertyId, // CAMBIADO: buildingId â†’ propertyId
        tenantId: createTicketDto.tenantId 
      }
    });

    if (!property) {
      throw new NotFoundException('Property not found in this tenant');
    }

    // Si hay unitId, verificar que la unidad pertenece a la propiedad y al tenant
    if (createTicketDto.unitId) {
      const unit = await this.prisma.unit.findFirst({
        where: { 
          id: createTicketDto.unitId,
          propertyId: createTicketDto.propertyId, // CAMBIADO: buildingId â†’ propertyId
          tenantId: createTicketDto.tenantId
        }
      });

      if (!unit) {
        throw new ForbiddenException('Unit not found in this property and tenant');
      }
    }

    // Si se asigna a alguien, verificar que tiene acceso al tenant
    if (createTicketDto.assignedTo) {
      const assignedUserTenant = await this.prisma.userTenant.findUnique({
        where: {
          userId_tenantId: {
            userId: createTicketDto.assignedTo,
            tenantId: createTicketDto.tenantId
          }
        }
      });

      if (!assignedUserTenant) {
        throw new ForbiddenException('Assigned user does not have access to this tenant');
      }
    }

    return this.prisma.ticket.create({
      data: {
        title: createTicketDto.title,
        description: createTicketDto.description,
        priority: createTicketDto.priority || Priority.MEDIUM,
        status: TicketStatus.OPEN,
        category: createTicketDto.category,
        photos: createTicketDto.photos || [],
        propertyId: createTicketDto.propertyId, // CAMBIADO: buildingId â†’ propertyId
        unitId: createTicketDto.unitId,
        userId: userId,
        tenantId: createTicketDto.tenantId, // AGREGADO: tenantId
        assignedToId: createTicketDto.assignedTo,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        property: { // CAMBIADO: building â†’ property
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        unit: {
          select: {
            id: true,
            number: true,
            floor: true,
          },
        },
      },
    });
  }

  async findAll(userId: string, userRole: UserRole, tenantId: string, propertyId?: string) {
    const where: any = { tenantId }; // AGREGADO: siempre filtrar por tenant

    // Filtrar segÃºn el rol del usuario
    if (userRole === UserRole.RESIDENT) {
      // Residentes ven tickets de sus unidades en este tenant
      where.unit = {
        managerId: userId,
        tenantId: tenantId
      };
    } else if (userRole === UserRole.MAINTENANCE) {
      // Personal de mantenimiento ve tickets asignados o sin asignar en este tenant
      where.OR = [
        { assignedToId: userId },
        { assignedToId: null },
      ];
    } else if (userRole === UserRole.ADMIN) {
      // Admins ven tickets de sus propiedades en este tenant
      if (propertyId) {
        where.propertyId = propertyId; // CAMBIADO: buildingId â†’ propertyId
      } else {
        // Si no hay propertyId, ver todas las propiedades del admin en este tenant
        where.property = { // CAMBIADO: building â†’ property
          ownerId: userId,
          tenantId: tenantId
        };
      }
    }

    return this.prisma.ticket.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        property: { // CAMBIADO: building â†’ property
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        unit: {
          select: {
            id: true,
            number: true,
            floor: true,
          },
        },
      },
      orderBy: {
        priority: 'desc',
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, userId: string, userRole: UserRole, tenantId: string) {
    const ticket = await this.prisma.ticket.findFirst({
      where: { 
        id,
        tenantId // AGREGADO: filtrar por tenant
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        property: { // CAMBIADO: building â†’ property
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        unit: {
          select: {
            id: true,
            number: true,
            floor: true,
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found in this tenant');
    }

    // Verificar permisos de acceso
    await this.verifyTicketAccess(ticket, userId, userRole, tenantId);

    return ticket;
  }

  async update(id: string, updateTicketDto: UpdateTicketDto, userId: string, userRole: UserRole, tenantId: string) {
    const ticket = await this.prisma.ticket.findFirst({
      where: { 
        id,
        tenantId // AGREGADO: filtrar por tenant
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found in this tenant');
    }

    // Verificar permisos de acceso
    await this.verifyTicketAccess(ticket, userId, userRole, tenantId);

    // Si se cambia el usuario asignado, verificar que tiene acceso al tenant
    if (updateTicketDto.assignedTo) {
      const assignedUserTenant = await this.prisma.userTenant.findUnique({
        where: {
          userId_tenantId: {
            userId: updateTicketDto.assignedTo,
            tenantId: tenantId
          }
        }
      });

      if (!assignedUserTenant) {
        throw new ForbiddenException('Assigned user does not have access to this tenant');
      }
    }

    return this.prisma.ticket.update({
      where: { id },
      data: {
        title: updateTicketDto.title,
        description: updateTicketDto.description,
        priority: updateTicketDto.priority,
        status: updateTicketDto.status,
        category: updateTicketDto.category,
        photos: updateTicketDto.photos,
        assignedToId: updateTicketDto.assignedTo,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        property: { // CAMBIADO: building â†’ property
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        unit: {
          select: {
            id: true,
            number: true,
            floor: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string, userRole: UserRole, tenantId: string) {
    const ticket = await this.prisma.ticket.findFirst({
      where: { 
        id,
        tenantId // AGREGADO: filtrar por tenant
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found in this tenant');
    }

    // Solo admins y el creador pueden eliminar tickets
    if (userRole !== UserRole.ADMIN && ticket.userId !== userId) {
      throw new ForbiddenException('No tienes permisos para eliminar este ticket');
    }

    return this.prisma.ticket.delete({
      where: { id },
    });
  }

  async assignToMe(id: string, userId: string, tenantId: string) {
    const ticket = await this.prisma.ticket.findFirst({
      where: { 
        id,
        tenantId // AGREGADO: filtrar por tenant
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found in this tenant');
    }

    // Verificar que el usuario tiene rol de mantenimiento en este tenant
    const userTenant = await this.prisma.userTenant.findUnique({
      where: {
        userId_tenantId: {
          userId: userId,
          tenantId: tenantId
        }
      }
    });

    if (!userTenant || userTenant.role !== UserRole.MAINTENANCE) {
      throw new ForbiddenException('Only maintenance users can assign tickets to themselves');
    }

    return this.prisma.ticket.update({
      where: { id },
      data: {
        assignedToId: userId,
        status: TicketStatus.IN_PROGRESS,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        property: { // CAMBIADO: building â†’ property
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        unit: {
          select: {
            id: true,
            number: true,
            floor: true,
          },
        },
      },
    });
  }

  async completeTicket(id: string, userId: string, userRole: UserRole, tenantId: string) {
    const ticket = await this.prisma.ticket.findFirst({
      where: { 
        id,
        tenantId // AGREGADO: filtrar por tenant
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found in this tenant');
    }

    // Verificar permisos
    await this.verifyTicketAccess(ticket, userId, userRole, tenantId);

    return this.prisma.ticket.update({
      where: { id },
      data: {
        status: TicketStatus.RESOLVED, 
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        property: { // CAMBIADO: building â†’ property
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        unit: {
          select: {
            id: true,
            number: true,
            floor: true,
          },
        },
      },
    });
  }

  async addPhoto(id: string, photoUrl: string, userId: string, userRole: UserRole, tenantId: string) {
    const ticket = await this.prisma.ticket.findFirst({
      where: { 
        id,
        tenantId // AGREGADO: filtrar por tenant
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found in this tenant');
    }

    // Verificar permisos de acceso
    await this.verifyTicketAccess(ticket, userId, userRole, tenantId);

    const updatedPhotos = [...ticket.photos, photoUrl];

    return this.prisma.ticket.update({
      where: { id },
      data: {
        photos: updatedPhotos,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        property: { // CAMBIADO: building â†’ property
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        unit: {
          select: {
            id: true,
            number: true,
            floor: true,
          },
        },
      },
    });
  }

  async getStats(userId: string, userRole: UserRole, tenantId: string, propertyId?: string) {
    const where: any = { tenantId }; // AGREGADO: filtrar por tenant

    // Aplicar filtros segÃºn el rol
    if (userRole === UserRole.RESIDENT) {
      where.unit = {
        managerId: userId,
        tenantId: tenantId
      };
    } else if (userRole === UserRole.MAINTENANCE) {
      where.assignedToId = userId;
    } else if (userRole === UserRole.ADMIN) {
      if (propertyId) {
        where.propertyId = propertyId; // CAMBIADO: buildingId â†’ propertyId
      } else {
        where.property = { // CAMBIADO: building â†’ property
          ownerId: userId,
          tenantId: tenantId
        };
      }
    }

    const [total, open, inProgress, resolved] = await Promise.all([
      this.prisma.ticket.count({ where }),
      this.prisma.ticket.count({ where: { ...where, status: TicketStatus.OPEN } }),
      this.prisma.ticket.count({ where: { ...where, status: TicketStatus.IN_PROGRESS } }),
      this.prisma.ticket.count({ where: { ...where, status: TicketStatus.RESOLVED } }),
    ]);

    return {
      total,
      open,
      inProgress,
      resolved,
      resolvedPercentage: total > 0 ? (resolved / total) * 100 : 0,
    };
  }

  private async verifyTicketAccess(ticket: any, userId: string, userRole: UserRole, tenantId: string) {
    if (userRole === UserRole.ADMIN) {
      // Admins tienen acceso si son dueÃ±os de la propiedad en este tenant
      const property = await this.prisma.property.findFirst({
        where: {
          id: ticket.propertyId, // CAMBIADO: buildingId â†’ propertyId
          ownerId: userId,
          tenantId: tenantId
        },
      });

      if (!property) {
        throw new ForbiddenException('Access denied to this ticket');
      }
      return true;
    }

    if (userRole === UserRole.RESIDENT) {
      // Residentes tienen acceso si son managers de la unidad en este tenant
      const unitAccess = await this.prisma.unit.findFirst({
        where: {
          id: ticket.unitId,
          managerId: userId,
          tenantId: tenantId
        },
      });

      if (!unitAccess) {
        throw new ForbiddenException('Access denied to this ticket');
      }
      return true;
    }

    if (userRole === UserRole.MAINTENANCE) {
      // Personal de mantenimiento tiene acceso si estÃ¡ asignado al ticket
      if (ticket.assignedToId !== userId) {
        throw new ForbiddenException('Access denied to this ticket');
      }
      return true;
    }

    throw new ForbiddenException('Access denied to this ticket');
  }
}
