
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { UserRole, TicketStatus, Priority } from '@prisma/client';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  async create(createTicketDto: CreateTicketDto, userId: string) {
    return this.prisma.ticket.create({
      data: {
        title: createTicketDto.title,
        description: createTicketDto.description,
        priority: createTicketDto.priority || Priority.MEDIUM,
        status: TicketStatus.OPEN,
        category: createTicketDto.category,
        photos: createTicketDto.photos || [],
        buildingId: createTicketDto.buildingId, // AGREGAR buildingId requerido
        unitId: createTicketDto.unitId, // AGREGAR unitId
        userId: userId, // CAMBIAR a userId
        assignedToId: createTicketDto.assignedTo, // CAMBIAR a assignedToId
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
        assignedTo: { // CAMBIAR de assignedUser a assignedTo
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        building: { // AGREGAR building
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        unit: { // AGREGAR unit
          select: {
            id: true,
            number: true,
            floor: true,
          },
        },
      },
    });
  }

  async findAll(userId: string, userRole: UserRole, buildingId?: string) {
    const where: any = {};

    // Filtrar según el rol del usuario
    if (userRole === UserRole.RESIDENT) {
      // Residentes ven tickets de sus unidades
      where.unit = {
        managerId: userId,
      };
    } else if (userRole === UserRole.MAINTENANCE) {
      // Personal de mantenimiento ve tickets asignados o sin asignar
      where.OR = [
        { assignedToId: userId }, // CAMBIAR a assignedToId
        { assignedToId: null },
      ];
    } else if (userRole === UserRole.ADMIN) {
      // Admins ven tickets de sus edificios
      if (buildingId) {
        where.buildingId = buildingId;
      } else {
        // Si no hay buildingId, ver todos los edificios del admin
        where.building = {
          ownerId: userId,
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
        assignedTo: { // CAMBIAR de assignedUser a assignedTo
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        building: {
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

  async findOne(id: string, userId: string, userRole: UserRole) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        assignedTo: { // CAMBIAR de assignedUser a assignedTo
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        building: {
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
      throw new NotFoundException('Ticket not found');
    }

    // Verificar permisos de acceso
    await this.verifyTicketAccess(ticket, userId, userRole);

    return ticket;
  }

  async update(id: string, updateTicketDto: UpdateTicketDto, userId: string, userRole: UserRole) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // Verificar permisos de acceso
    await this.verifyTicketAccess(ticket, userId, userRole);

    return this.prisma.ticket.update({
      where: { id },
      data: {
        title: updateTicketDto.title,
        description: updateTicketDto.description,
        priority: updateTicketDto.priority,
        status: updateTicketDto.status,
        category: updateTicketDto.category,
        photos: updateTicketDto.photos,
        assignedToId: updateTicketDto.assignedTo, // CAMBIAR a assignedToId
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
        assignedTo: { // CAMBIAR de assignedUser a assignedTo
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        building: {
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

  async remove(id: string, userId: string, userRole: UserRole) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // Solo admins y el creador pueden eliminar tickets
    if (userRole !== UserRole.ADMIN && ticket.userId !== userId) {
      throw new ForbiddenException('No tienes permisos para eliminar este ticket');
    }

    return this.prisma.ticket.delete({
      where: { id },
    });
  }

  async assignToMe(id: string, userId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return this.prisma.ticket.update({
      where: { id },
      data: {
        assignedToId: userId, // CAMBIAR a assignedToId
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
        assignedTo: { // CAMBIAR de assignedUser a assignedTo
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        building: {
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

  async completeTicket(id: string, userId: string, userRole: UserRole) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // Verificar permisos
    await this.verifyTicketAccess(ticket, userId, userRole);

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
        building: {
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

  async addPhoto(id: string, photoUrl: string, userId: string, userRole: UserRole) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // Verificar permisos de acceso
    await this.verifyTicketAccess(ticket, userId, userRole);

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
        assignedTo: { // CAMBIAR de assignedUser a assignedTo
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        building: {
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

  async getStats(userId: string, userRole: UserRole, buildingId?: string) {
    const where: any = {};

    // Aplicar filtros según el rol
    if (userRole === UserRole.RESIDENT) {
      where.unit = {
        managerId: userId,
      };
    } else if (userRole === UserRole.MAINTENANCE) {
      where.assignedToId = userId;
    } else if (userRole === UserRole.ADMIN) {
      if (buildingId) {
        where.buildingId = buildingId;
      } else {
        where.building = {
          ownerId: userId,
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

  private async verifyTicketAccess(ticket: any, userId: string, userRole: UserRole) {
    if (userRole === UserRole.ADMIN) {
      // Admins tienen acceso si son dueños del edificio
      const building = await this.prisma.building.findFirst({
        where: {
          id: ticket.buildingId,
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
      const unitAccess = await this.prisma.unit.findFirst({
        where: {
          id: ticket.unitId,
          managerId: userId,
        },
      });

      if (!unitAccess) {
        throw new ForbiddenException('Access denied');
      }
      return true;
    }

    if (userRole === UserRole.MAINTENANCE) {
      // Personal de mantenimiento tiene acceso si está asignado al ticket
      if (ticket.assignedToId !== userId) { // CAMBIAR a assignedToId
        throw new ForbiddenException('Access denied');
      }
      return true;
    }

    throw new ForbiddenException('Access denied');
  }
}