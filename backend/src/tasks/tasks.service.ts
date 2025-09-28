
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto, userId: string) {
    return this.prisma.task.create({
      data: {
        title: createTaskDto.title,
        description: createTaskDto.description,
        priority: createTaskDto.priority,
        status: createTaskDto.status || 'PENDING',
        dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
        photos: createTaskDto.photos || [],
        buildingId: createTaskDto.buildingId, // AGREGAR buildingId requerido
        assignedToId: createTaskDto.assignedTo, // CAMBIAR a assignedToId
        createdById: userId, // CAMBIAR a createdById
      },
      include: {
        assignedTo: { // CAMBIAR de assignedUser a assignedTo
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: { // CAMBIAR de createdUser a createdBy
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        building: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findAll(userId: string, userRole: UserRole) {
    const where: any = {};

    // Filtrar según el rol del usuario
    if (userRole === UserRole.MAINTENANCE) {
      where.assignedToId = userId; // CAMBIAR a assignedToId
    } else if (userRole === UserRole.RESIDENT) {
      // Residentes ven tareas de sus edificios
      where.building = {
        units: {
          some: {
            managerId: userId,
          },
        },
      };
    }
    // Admins ven todas las tareas de sus edificios

    return this.prisma.task.findMany({
      where,
      include: {
        assignedTo: { // CAMBIAR de assignedUser a assignedTo
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        createdBy: { // CAMBIAR de createdUser a createdBy
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        building: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    });
  }

  async findOne(id: string, userId: string, userRole: UserRole) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        assignedTo: { // CAMBIAR de assignedUser a assignedTo
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        createdBy: { // CAMBIAR de createdUser a createdBy
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        building: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Verificar permisos de acceso
    await this.verifyTaskAccess(task, userId, userRole);

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string, userRole: UserRole) {
    const task = await this.prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Verificar permisos de acceso
    await this.verifyTaskAccess(task, userId, userRole);

    try {
      return await this.prisma.task.update({
        where: { id },
        data: {
          title: updateTaskDto.title,
          description: updateTaskDto.description,
          priority: updateTaskDto.priority,
          status: updateTaskDto.status,
          dueDate: updateTaskDto.dueDate ? new Date(updateTaskDto.dueDate) : null,
          photos: updateTaskDto.photos,
          assignedToId: updateTaskDto.assignedTo, // CAMBIAR a assignedToId
        },
        include: {
          assignedTo: { // CAMBIAR de assignedUser a assignedTo
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          createdBy: { // CAMBIAR de createdUser a createdBy
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          building: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    } catch {
      throw new NotFoundException('Task not found');
    }
  }

  async remove(id: string, userId: string, userRole: UserRole) {
    const task = await this.prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Solo admins y el creador pueden eliminar tareas
    if (userRole !== UserRole.ADMIN && task.createdById !== userId) {
      throw new ForbiddenException('No tienes permisos para eliminar esta tarea');
    }

    try {
      return await this.prisma.task.delete({
        where: { id },
      });
    } catch {
      throw new NotFoundException('Task not found');
    }
  }

  async addPhoto(id: string, photoUrl: string, userId: string, userRole: UserRole) {
    const task = await this.prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Verificar permisos de acceso
    await this.verifyTaskAccess(task, userId, userRole);

    const updatedPhotos = [...task.photos, photoUrl];

    return this.prisma.task.update({
      where: { id },
      data: {
        photos: updatedPhotos,
      },
      include: {
        assignedTo: { // CAMBIAR de assignedUser a assignedTo
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: { // CAMBIAR de createdUser a createdBy
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async completeTask(id: string, userId: string, userRole: UserRole) {
    const task = await this.prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Solo el asignado o un admin puede completar la tarea
    if (userRole !== UserRole.ADMIN && task.assignedToId !== userId) {
      throw new ForbiddenException('No tienes permisos para completar esta tarea');
    }

    return this.prisma.task.update({
      where: { id },
      data: {
        status: 'COMPLETED',
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  private async verifyTaskAccess(task: any, userId: string, userRole: UserRole) {
    if (userRole === UserRole.ADMIN) {
      return true; // Admins tienen acceso completo
    }

    if (userRole === UserRole.MAINTENANCE && task.assignedToId !== userId) {
      throw new ForbiddenException('Access denied'); // CAMBIAR a assignedToId
    }

    if (userRole === UserRole.RESIDENT) {
      // Verificar si el residente tiene unidades en el edificio de la tarea
      const userBuildingAccess = await this.prisma.unit.findFirst({
        where: {
          managerId: userId,
          buildingId: task.buildingId,
        },
      });

      if (!userBuildingAccess) {
        throw new ForbiddenException('Access denied');
      }
    }

    return true;
  }
}
