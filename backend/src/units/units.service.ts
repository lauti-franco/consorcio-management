import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';

@Injectable()
export class UnitsService {
  constructor(private prisma: PrismaService) {}

  async create(createUnitDto: CreateUnitDto, userId: string) {
    // Verificar que el usuario es admin del edificio
    const building = await this.prisma.building.findFirst({
      where: { 
        id: createUnitDto.buildingId,
        ownerId: userId 
      },
    });

    if (!building) {
      throw new ForbiddenException('No tienes permisos para agregar unidades a este edificio');
    }

    return this.prisma.unit.create({
      data: {
        ...createUnitDto,
        features: createUnitDto.features || [],
      },
      include: {
        building: true,
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findAll(buildingId: string, userId: string) {
    // Verificar permisos del edificio
    const building = await this.prisma.building.findFirst({
      where: { 
        id: buildingId,
        OR: [
          { ownerId: userId },
          { units: { some: { managerId: userId } } }
        ]
      },
    });

    if (!building) {
      throw new ForbiddenException('No tienes permisos para ver las unidades de este edificio');
    }

    return this.prisma.unit.findMany({
      where: { buildingId },
      include: {
        building: true,
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            expenses: true,
            payments: true,
            tickets: true,
          },
        },
      },
      orderBy: { floor: 'asc' },
    });
  }

  async findOne(id: string, userId: string) {
    const unit = await this.prisma.unit.findFirst({
      where: { 
        id,
        OR: [
          { building: { ownerId: userId } },
          { managerId: userId },
          { building: { ownerId: userId } }
        ]
      },
      include: {
        building: true,
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        expenses: {
          take: 5,
          orderBy: { dueDate: 'desc' },
        },
        payments: {
          take: 10,
          orderBy: { date: 'desc' },
          include: {
            expense: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        tickets: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!unit) {
      throw new NotFoundException('Unit not found or no access');
    }

    return unit;
  }

  async update(id: string, updateUnitDto: UpdateUnitDto, userId: string) {
    await this.verifyUnitAccess(id, userId);

    return this.prisma.unit.update({
      where: { id },
      data: {
        ...updateUnitDto,
        features: updateUnitDto.features || undefined,
      },
      include: {
        building: true,
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    await this.verifyUnitAccess(id, userId);

    return this.prisma.unit.delete({
      where: { id },
    });
  }

  async getUnitStats(id: string, userId: string) {
    await this.verifyUnitAccess(id, userId);

    const [currentExpenses, paymentHistory, activeTickets] = await Promise.all([
      this.prisma.expense.findMany({
        where: {
          unitId: id,
          status: { in: ['OPEN', 'OVERDUE'] },
        },
        include: {
          payments: {
            where: {
              unitId: id,
            },
          },
        },
      }),
      this.prisma.payment.findMany({
        where: {
          unitId: id,
          status: 'COMPLETED',
        },
        orderBy: { date: 'desc' },
        take: 6,
      }),
      this.prisma.ticket.count({
        where: {
          unitId: id,
          status: { in: ['OPEN', 'IN_PROGRESS'] },
        },
      }),
    ]);

    const totalDue = currentExpenses.reduce((sum, expense) => {
      const paidAmount = expense.payments.reduce((paid, payment) => paid + payment.amount, 0);
      return sum + (expense.amount - paidAmount);
    }, 0);

    return {
      totalDue,
      activeTickets,
      paymentHistory,
      currentExpenses: currentExpenses.map(expense => ({
        ...expense,
        paidAmount: expense.payments.reduce((sum, payment) => sum + payment.amount, 0),
        remaining: expense.amount - expense.payments.reduce((sum, payment) => sum + payment.amount, 0),
      })),
    };
  }

  private async verifyUnitAccess(unitId: string, userId: string) {
    const unit = await this.prisma.unit.findFirst({
      where: { 
        id: unitId,
        building: { ownerId: userId }
      },
    });

    if (!unit) {
      throw new ForbiddenException('No tienes permisos para modificar esta unidad');
    }

    return unit;
  }
}