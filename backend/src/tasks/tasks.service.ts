import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UserRole } from '../common/types';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto, userId: string) {
    return this.prisma.task.create({
      data: {
        ...createTaskDto,
        createdBy: userId,
        photos: createTaskDto.photos || [],
        dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
      },
      include: {
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findAll(userId: string, userRole: UserRole) {
    const where: any = {};

    if (userRole === UserRole.MAINTENANCE) {
      where.assignedTo = userId;
    }

    return this.prisma.task.findMany({
      where,
      include: {
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdUser: {
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
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (userRole === UserRole.MAINTENANCE && task.assignedTo !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string, userRole: UserRole) {
    const task = await this.prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (userRole === UserRole.MAINTENANCE && task.assignedTo !== userId) {
      throw new ForbiddenException('Access denied');
    }

    try {
      return await this.prisma.task.update({
        where: { id },
        data: {
          ...updateTaskDto,
          dueDate: updateTaskDto.dueDate ? new Date(updateTaskDto.dueDate) : null,
        },
        include: {
          assignedUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          createdUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    } catch {
      throw new NotFoundException('Task not found');
    }
  }

  async remove(id: string, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    try {
      return await this.prisma.task.delete({
        where: { id },
      });
    } catch {
      throw new NotFoundException('Task not found');
    }
  }

  async addPhoto(id: string, photoUrl: string, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const updatedPhotos = [...task.photos, photoUrl];

    return this.prisma.task.update({
      where: { id },
      data: {
        photos: updatedPhotos,
      },
      include: {
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }
}