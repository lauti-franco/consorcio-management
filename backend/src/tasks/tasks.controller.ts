
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@ApiTags('tasks')
@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()

export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @Roles(UserRole.ADMIN) // AHORA compatible
  @ApiOperation({ summary: 'Create a new task (Admin only)' })
  create(@Body() createTaskDto: CreateTaskDto, @Req() req: any) {
    return this.tasksService.create(createTaskDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks' })
  findAll(@Req() req: any) {
    return this.tasksService.findAll(req.user.id, req.user.role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID' })
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.tasksService.findOne(id, req.user.id, req.user.role);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update task' })
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto, @Req() req: any) {
    return this.tasksService.update(id, updateTaskDto, req.user.id, req.user.role);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN) // AHORA compatible
  @ApiOperation({ summary: 'Delete task (Admin only)' })
  remove(@Param('id') id: string, @Req() req: any) {
    return this.tasksService.remove(id, req.user.id, req.user.role);
  }

  @Post(':id/photos')
  @Roles(UserRole.MAINTENANCE) // AHORA compatible
  @ApiOperation({ summary: 'Add photo to task (Maintenance only)' })
  addPhoto(@Param('id') id: string, @Body('photoUrl') photoUrl: string, @Req() req: any) {
    return this.tasksService.addPhoto(id, photoUrl, req.user.id, req.user.role);
  }

  @Post(':id/complete')
  @Roles(UserRole.MAINTENANCE, UserRole.ADMIN) // AHORA compatible
  @ApiOperation({ summary: 'Mark task as completed' })
  completeTask(@Param('id') id: string, @Req() req: any) {
    return this.tasksService.completeTask(id, req.user.id, req.user.role);
  }
}
