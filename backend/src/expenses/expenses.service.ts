import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { UserRole } from '../common/types';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  async create(createExpenseDto: CreateExpenseDto, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can create expenses');
    }

    return this.prisma.expense.create({
      data: {
        ...createExpenseDto,
        dueDate: new Date(createExpenseDto.dueDate),
      },
      include: {
        building: true,
        payments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async findAll(userId: string, userRole: UserRole, buildingId?: string) {
    const where: any = {};

    if (userRole === UserRole.RESIDENT) {
      where.buildingId = buildingId;
    } else if (userRole === UserRole.ADMIN && buildingId) {
      where.buildingId = buildingId;
    }

    return this.prisma.expense.findMany({
      where,
      include: {
        building: true,
        payments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        dueDate: 'desc',
      },
    });
  }

  async findOne(id: string, userId: string, userRole: UserRole, buildingId?: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
      include: {
        building: true,
        payments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    if (userRole === UserRole.RESIDENT && expense.buildingId !== buildingId) {
      throw new ForbiddenException('Access denied');
    }

    return expense;
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can update expenses');
    }

    try {
      return await this.prisma.expense.update({
        where: { id },
        data: updateExpenseDto,
        include: {
          building: true,
          payments: true,
        },
      });
    } catch {
      throw new NotFoundException('Expense not found');
    }
  }

  async remove(id: string, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can delete expenses');
    }

    try {
      return await this.prisma.expense.delete({
        where: { id },
      });
    } catch {
      throw new NotFoundException('Expense not found');
    }
  }

  async getStats(buildingId?: string) {
    const where = buildingId ? { buildingId } : {};

    const total = await this.prisma.expense.count({ where });
    const open = await this.prisma.expense.count({ where: { ...where, status: 'OPEN' } });
    const paid = await this.prisma.expense.count({ where: { ...where, status: 'PAID' } });
    const overdue = await this.prisma.expense.count({ where: { ...where, status: 'OVERDUE' } });

    const totalAmount = await this.prisma.expense.aggregate({
      where,
      _sum: { amount: true },
    });

    const paidAmount = await this.prisma.expense.aggregate({
      where: { ...where, status: 'PAID' },
      _sum: { amount: true },
    });

    return {
      total,
      open,
      paid,
      overdue,
      totalAmount: totalAmount._sum.amount || 0,
      paidAmount: paidAmount._sum.amount || 0,
      pendingAmount: (totalAmount._sum.amount || 0) - (paidAmount._sum.amount || 0),
    };
  }
}