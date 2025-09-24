import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';

@Injectable()
export class BuildingsService {
  constructor(private prisma: PrismaService) {}

  async create(createBuildingDto: CreateBuildingDto) {
    return this.prisma.building.create({
      data: createBuildingDto,
    });
  }

  async findAll() {
    return this.prisma.building.findMany({
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        expenses: true,
      },
    });
  }

  async findOne(id: string) {
    const building = await this.prisma.building.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        expenses: {
          include: {
            payments: true,
          },
        },
      },
    });

    if (!building) {
      throw new NotFoundException('Building not found');
    }

    return building;
  }

  async update(id: string, updateBuildingDto: UpdateBuildingDto) {
    try {
      return await this.prisma.building.update({
        where: { id },
        data: updateBuildingDto,
      });
    } catch {
      throw new NotFoundException('Building not found');
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.building.delete({
        where: { id },
      });
    } catch {
      throw new NotFoundException('Building not found');
    }
  }
}