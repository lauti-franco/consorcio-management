import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { UserRole } from '../common/types';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  async create(createTicketDto: CreateTicketDto, userId: string) {
    return this.prisma.ticket.create({
      data: {
        ...createTicketDto,
        userId,
        photos: createTicketDto.photos || [],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            building: true,
          },
        },
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findAll(userId: string, userRole: UserRole, buildingId?: string) {
    const where: any = {};

    if (userRole === UserRole.RESIDENT) {
      where.userId = userId;
    } else if (userRole === UserRole.MAINTENANCE) {
      where.OR = [
        { assignedTo: userId },
        { assignedTo: null },
      ];
    } else if (userRole === UserRole.ADMIN && buildingId) {
      where.user = { buildingId };
    }

    return this.prisma.ticket.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            building: true,
          },
        },
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
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
            building: true,
          },
        },
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (userRole === UserRole.RESIDENT && ticket.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return ticket;
  }

  async update(id: string, updateTicketDto: UpdateTicketDto, userId: string, userRole: UserRole) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (userRole === UserRole.RESIDENT && ticket.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (userRole === UserRole.MAINTENANCE && ticket.assignedTo !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.ticket.update({
      where: { id },
      data: updateTicketDto,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            building: true,
          },
        },
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
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

    if (userRole === UserRole.RESIDENT && ticket.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can delete tickets');
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
        assignedTo: userId,
        status: 'IN_PROGRESS',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            building: true,
          },
        },
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async addPhoto(id: string, photoUrl: string, userId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

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
            building: true,
          },
        },
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async getStats() {
    const total = await this.prisma.ticket.count();
    const open = await this.prisma.ticket.count({ where: { status: 'OPEN' } });
    const inProgress = await this.prisma.ticket.count({ where: { status: 'IN_PROGRESS' } });
    const resolved = await this.prisma.ticket.count({ where: { status: 'RESOLVED' } });

    return {
      total,
      open,
      inProgress,
      resolved,
      resolvedPercentage: total > 0 ? (resolved / total) * 100 : 0,
    };
  }
}