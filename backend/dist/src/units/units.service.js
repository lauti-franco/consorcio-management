"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnitsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UnitsService = class UnitsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createUnitDto, userId) {
        const building = await this.prisma.building.findFirst({
            where: {
                id: createUnitDto.buildingId,
                ownerId: userId
            },
        });
        if (!building) {
            throw new common_1.ForbiddenException('No tienes permisos para agregar unidades a este edificio');
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
    async findAll(buildingId, userId) {
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
            throw new common_1.ForbiddenException('No tienes permisos para ver las unidades de este edificio');
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
    async findOne(id, userId) {
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
            throw new common_1.NotFoundException('Unit not found or no access');
        }
        return unit;
    }
    async update(id, updateUnitDto, userId) {
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
    async remove(id, userId) {
        await this.verifyUnitAccess(id, userId);
        return this.prisma.unit.delete({
            where: { id },
        });
    }
    async getUnitStats(id, userId) {
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
    async verifyUnitAccess(unitId, userId) {
        const unit = await this.prisma.unit.findFirst({
            where: {
                id: unitId,
                building: { ownerId: userId }
            },
        });
        if (!unit) {
            throw new common_1.ForbiddenException('No tienes permisos para modificar esta unidad');
        }
        return unit;
    }
};
exports.UnitsService = UnitsService;
exports.UnitsService = UnitsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UnitsService);
//# sourceMappingURL=units.service.js.map