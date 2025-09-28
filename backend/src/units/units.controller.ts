import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { UnitsService } from './units.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('units')
@Controller('units')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new unit' })
  create(@Body() createUnitDto: CreateUnitDto, @CurrentUser() user: any) {
    return this.unitsService.create(createUnitDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all units for a building' })
  findAll(@Query('buildingId') buildingId: string, @CurrentUser() user: any) {
    return this.unitsService.findAll(buildingId, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get unit by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.unitsService.findOne(id, user.id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get unit statistics' })
  getStats(@Param('id') id: string, @CurrentUser() user: any) {
    return this.unitsService.getUnitStats(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update unit' })
  update(@Param('id') id: string, @Body() updateUnitDto: UpdateUnitDto, @CurrentUser() user: any) {
    return this.unitsService.update(id, updateUnitDto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete unit' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.unitsService.remove(id, user.id);
  }
}