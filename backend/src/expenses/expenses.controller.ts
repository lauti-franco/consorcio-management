import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@ApiTags('expenses')
@Controller('expenses')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new expense' })
  create(@Body() createExpenseDto: CreateExpenseDto, @Req() req: any) {
    return this.expensesService.create(createExpenseDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all expenses' })
  findAll(@Req() req: any, @Query('buildingId') buildingId?: string) {
    return this.expensesService.findAll(req.user.id, req.user.role, buildingId || req.user.buildingId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get expenses statistics' })
  getStats(@Req() req: any) {
    return this.expensesService.getStats(req.user.buildingId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get expense by ID' })
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.expensesService.findOne(id, req.user.id, req.user.role, req.user.buildingId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update expense' })
  update(@Param('id') id: string, @Body() updateExpenseDto: UpdateExpenseDto, @Req() req: any) {
    return this.expensesService.update(id, updateExpenseDto, req.user.id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete expense' })
  remove(@Param('id') id: string, @Req() req: any) {
    return this.expensesService.remove(id, req.user.id);
  }
}