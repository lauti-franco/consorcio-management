// src/tasks/tasks.controller.ts - CORREGIDO PARA MULTI-TENANT
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client'; // CAMBIADO: usar enum de Prisma

@ApiTags('tasks')
@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new task (Admin only)' })
  create(@Body() createTaskDto: CreateTaskDto, @Req() req: Request) {
    return this.tasksService.create({
      ...createTaskDto,
      tenantId: req.tenant.id // ← AGREGADO: tenant del middleware
    }, (req.user as any).id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks for current tenant' })
  findAll(@Req() req: Request) {
    return this.tasksService.findAll(
      (req.user as any).id, 
      req.userTenantRole, // ← CAMBIADO: usar userTenantRole del middleware
      req.tenant.id // ← AGREGADO: tenant del middleware
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID' })
  findOne(@Param('id') id: string, @Req() req: Request) {
    return this.tasksService.findOne(
      id, 
      (req.user as any).id, 
      req.userTenantRole, // ← CAMBIADO: usar userTenantRole del middleware
      req.tenant.id // ← AGREGADO: tenant del middleware
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update task' })
  update(
    @Param('id') id: string, 
    @Body() updateTaskDto: UpdateTaskDto, 
    @Req() req: Request
  ) {
    return this.tasksService.update(
      id, 
      updateTaskDto, 
      (req.user as any).id, 
      req.userTenantRole, // ← CAMBIADO: usar userTenantRole del middleware
      req.tenant.id // ← AGREGADO: tenant del middleware
    );
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete task (Admin only)' })
  remove(@Param('id') id: string, @Req() req: Request) {
    return this.tasksService.remove(
      id, 
      (req.user as any).id, 
      req.userTenantRole, // ← CAMBIADO: usar userTenantRole del middleware
      req.tenant.id // ← AGREGADO: tenant del middleware
    );
  }

  @Post(':id/photos')
  @Roles(UserRole.MAINTENANCE, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Add photo to task (Maintenance and Admin only)' })
  addPhoto(
    @Param('id') id: string, 
    @Body('photoUrl') photoUrl: string, 
    @Req() req: Request
  ) {
    return this.tasksService.addPhoto(
      id, 
      photoUrl, 
      (req.user as any).id, 
      req.userTenantRole, // ← CAMBIADO: usar userTenantRole del middleware
      req.tenant.id // ← AGREGADO: tenant del middleware
    );
  }

  @Post(':id/complete')
  @Roles(UserRole.MAINTENANCE, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Mark task as completed' })
  completeTask(@Param('id') id: string, @Req() req: Request) {
    return this.tasksService.completeTask(
      id, 
      (req.user as any).id, 
      req.userTenantRole, // ← CAMBIADO: usar userTenantRole del middleware
      req.tenant.id // ← AGREGADO: tenant del middleware
    );
  }
}