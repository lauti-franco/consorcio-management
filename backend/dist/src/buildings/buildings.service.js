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
exports.BuildingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let BuildingsService = class BuildingsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createBuildingDto, userId) {
        const userSubscription = await this.prisma.subscription.findUnique({
            where: { userId },
        });
        const buildingCount = await this.prisma.building.count({
            where: { ownerId: userId },
        });
        if (userSubscription && buildingCount >= userSubscription.maxBuildings) {
            throw new common_1.ForbiddenException(`Límite de edificios alcanzado. Tu plan permite máximo ${userSubscription.maxBuildings} edificios.`);
        }
        return this.prisma.building.create({
            data: {
                name: createBuildingDto.name,
                address: createBuildingDto.address,
                city: createBuildingDto.city,
                ownerId: userId,
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }
    async findAll(userId, userRole) {
        let whereCondition = {};
        if (userRole === 'RESIDENT') {
            whereCondition = {
                units: {
                    some: {
                        managerId: userId,
                    },
                },
            };
        }
        else if (userRole === 'MAINTENANCE') {
            whereCondition = {
                tickets: {
                    some: {
                        assignedToId: userId,
                    },
                },
            };
        }
        else if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
            whereCondition = { ownerId: userId };
        }
        else {
            whereCondition = { ownerId: userId };
        }
        return this.prisma.building.findMany({
            where: whereCondition,
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                _count: {
                    select: {
                        units: true,
                        expenses: true,
                        tickets: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id, userId, userRole) {
        await this.verifyBuildingAccess(id, userId, userRole);
        const building = await this.prisma.building.findUnique({
            where: { id },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
                units: {
                    include: {
                        manager: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                phone: true,
                            },
                        },
                    },
                    orderBy: { floor: 'asc' },
                },
                _count: {
                    select: {
                        units: true,
                        expenses: true,
                        tickets: true,
                    },
                },
            },
        });
        if (!building) {
            throw new common_1.NotFoundException('Building not found');
        }
        return building;
    }
    async update(id, updateBuildingDto, userId) {
        await this.verifyBuildingOwnership(id, userId);
        try {
            return await this.prisma.building.update({
                where: { id },
                data: updateBuildingDto,
                include: {
                    owner: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            });
        }
        catch {
            throw new common_1.NotFoundException('Building not found');
        }
    }
    async remove(id, userId) {
        await this.verifyBuildingOwnership(id, userId);
        try {
            return await this.prisma.building.update({
                where: { id },
                data: { isActive: false },
            });
        }
        catch {
            throw new common_1.NotFoundException('Building not found');
        }
    }
    async getBuildingStats(id, userId, userRole) {
        await this.verifyBuildingAccess(id, userId, userRole);
        const [totalUnits, occupiedUnits, activeTickets, pendingExpenses, monthlyRevenue, totalResidents,] = await Promise.all([
            this.prisma.unit.count({ where: { buildingId: id } }),
            this.prisma.unit.count({ where: { buildingId: id, isOccupied: true } }),
            this.prisma.ticket.count({
                where: {
                    buildingId: id,
                    status: { in: ['OPEN', 'IN_PROGRESS'] }
                }
            }),
            this.prisma.expense.aggregate({
                where: {
                    buildingId: id,
                    status: { in: ['OPEN', 'OVERDUE'] }
                },
                _sum: { amount: true },
            }),
            this.prisma.payment.aggregate({
                where: {
                    expense: { buildingId: id },
                    status: 'COMPLETED',
                    date: {
                        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                    },
                },
                _sum: { amount: true },
            }),
            this.prisma.user.count({
                where: {
                    managedUnits: {
                        some: {
                            buildingId: id,
                        },
                    },
                    role: 'RESIDENT',
                },
            }),
        ]);
        return {
            totalUnits,
            occupiedUnits,
            activeTickets,
            pendingExpenses: pendingExpenses._sum.amount || 0,
            monthlyRevenue: monthlyRevenue._sum.amount || 0,
            totalResidents,
            occupancyRate: totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0,
        };
    }
    async verifyBuildingAccess(buildingId, userId, userRole) {
        if (userRole === 'SUPER_ADMIN') {
            return true;
        }
        const building = await this.prisma.building.findFirst({
            where: {
                id: buildingId,
                OR: [
                    { ownerId: userId },
                    { units: { some: { managerId: userId } } },
                    { tickets: { some: { assignedToId: userId } } },
                ],
            },
        });
        if (!building) {
            throw new common_1.ForbiddenException('No tienes acceso a este edificio');
        }
        return building;
    }
    async verifyBuildingOwnership(buildingId, userId) {
        const building = await this.prisma.building.findFirst({
            where: { id: buildingId, ownerId: userId },
        });
        if (!building) {
            throw new common_1.ForbiddenException('No eres el propietario de este edificio');
        }
        return building;
    }
};
exports.BuildingsService = BuildingsService;
exports.BuildingsService = BuildingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BuildingsService);
//# sourceMappingURL=buildings.service.js.map