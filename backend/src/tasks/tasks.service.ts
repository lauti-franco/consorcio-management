// src/tasks/tasks.service.ts - CORREGIDO PARA MULTI-TENANT
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto & { tenantId: string }, userId: string) {
    // Verificar que la propiedad existe en el tenant
    const property = await this.prisma.property.findFirst({
      where: { 
        id: createTaskDto.propertyId, // CAMBIADO: buildingId → propertyId
        tenantId: createTaskDto.tenantId 
      }
    });

    if (!property) {
      throw new NotFoundException('Property not found in this tenant');
    }

    // Verificar que el usuario asignado existe y tiene acceso al tenant
    if (createTaskDto.assignedTo) {
      const assignedUserTenant = await this.prisma.userTenant.findUnique({
        where: {
          userId_tenantId: {
            userId: createTaskDto.assignedTo,
            tenantId: createTaskDto.tenantId
          }
        }
      });

      if (!assignedUserTenant) {
        throw new ForbiddenException('Assigned user does not have access to this tenant');
      }
    }

    return this.prisma.task.create({
      data: {
        title: createTaskDto.title,
        description: createTaskDto.description,
        priority: createTaskDto.priority,
        status: createTaskDto.status || 'PENDING',
        dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
        photos: createTaskDto.photos || [],
        propertyId: createTaskDto.propertyId, // CAMBIADO: buildingId → propertyId
        tenantId: createTaskDto.tenantId, // AGREGADO: tenantId
        assignedToId: createTaskDto.assignedTo,
        createdById: userId,
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
        property: { // CAMBIADO: building → property
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findAll(userId: string, userRole: UserRole, tenantId: string) {
    const where: any = { tenantId }; // AGREGADO: siempre filtrar por tenant

    // Filtrar según el rol del usuario
    if (userRole === UserRole.MAINTENANCE) {
      where.assignedToId = userId;
    } else if (userRole === UserRole.RESIDENT) {
      // Residentes ven tareas de sus propiedades
      where.property = { // CAMBIADO: building → property
        units: {
          some: {
            managerId: userId,
            tenantId: tenantId
          },
        },
      };
    }
    // Admins ven todas las tareas de sus propiedades en este tenant

    return this.prisma.task.findMany({
      where,
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        property: { // CAMBIADO: building → property
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

  async findOne(id: string, userId: string, userRole: UserRole, tenantId: string) {
    const task = await this.prisma.task.findFirst({
      where: { 
        id,
        tenantId // AGREGADO: filtrar por tenant
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        property: { // CAMBIADO: building → property
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found in this tenant');
    }

    // Verificar permisos de acceso
    await this.verifyTaskAccess(task, userId, userRole, tenantId);

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string, userRole: UserRole, tenantId: string) {
    const task = await this.prisma.task.findFirst({
      where: { 
        id,
        tenantId // AGREGADO: filtrar por tenant
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found in this tenant');
    }

    // Verificar permisos de acceso
    await this.verifyTaskAccess(task, userId, userRole, tenantId);

    // Si se cambia el usuario asignado, verificar que tiene acceso al tenant
    if (updateTaskDto.assignedTo) {
      const assignedUserTenant = await this.prisma.userTenant.findUnique({
        where: {
          userId_tenantId: {
            userId: updateTaskDto.assignedTo,
            tenantId: tenantId
          }
        }
      });

      if (!assignedUserTenant) {
        throw new ForbiddenException('Assigned user does not have access to this tenant');
      }
    }

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
          assignedToId: updateTaskDto.assignedTo,
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
          property: { // CAMBIADO: building → property
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

  async remove(id: string, userId: string, userRole: UserRole, tenantId: string) {
    const task = await this.prisma.task.findFirst({
      where: { 
        id,
        tenantId // AGREGADO: filtrar por tenant
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found in this tenant');
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

  async addPhoto(id: string, photoUrl: string, userId: string, userRole: UserRole, tenantId: string) {
    const task = await this.prisma.task.findFirst({
      where: { 
        id,
        tenantId // AGREGADO: filtrar por tenant
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found in this tenant');
    }

    // Verificar permisos de acceso
    await this.verifyTaskAccess(task, userId, userRole, tenantId);

    const updatedPhotos = [...task.photos, photoUrl];

    return this.prisma.task.update({
      where: { id },
      data: {
        photos: updatedPhotos,
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

  async completeTask(id: string, userId: string, userRole: UserRole, tenantId: string) {
    const task = await this.prisma.task.findFirst({
      where: { 
        id,
        tenantId // AGREGADO: filtrar por tenant
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found in this tenant');
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

  private async verifyTaskAccess(task: any, userId: string, userRole: UserRole, tenantId: string) {
    if (userRole === UserRole.ADMIN) {
      // Verificar que el admin es dueño de la propiedad
      const property = await this.prisma.property.findFirst({
        where: {
          id: task.propertyId, // CAMBIADO: buildingId → propertyId
          ownerId: userId,
          tenantId: tenantId
        }
      });

      if (!property) {
        throw new ForbiddenException('Access denied to this task');
      }
      return true;
    }

    if (userRole === UserRole.MAINTENANCE && task.assignedToId !== userId) {
      throw new ForbiddenException('Access denied to this task');
    }

    if (userRole === UserRole.RESIDENT) {
      // Verificar si el residente tiene unidades en la propiedad de la tarea
      const userPropertyAccess = await this.prisma.unit.findFirst({
        where: {
          managerId: userId,
          propertyId: task.propertyId, // CAMBIADO: buildingId → propertyId
          tenantId: tenantId
        },
      });

      if (!userPropertyAccess) {
        throw new ForbiddenException('Access denied to this task');
      }
    }

    return true;
  }
}