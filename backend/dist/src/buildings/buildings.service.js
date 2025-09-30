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
const client_1 = require("@prisma/client");
let BuildingsService = class BuildingsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createBuildingDto) {
        const tenant = await this.prisma.tenant.findUnique({
            where: {
                id: createBuildingDto.tenantId,
                isActive: true
            }
        });
        if (!tenant) {
            throw new common_1.BadRequestException('Tenant not found or inactive');
        }
        const userTenant = await this.prisma.userTenant.findUnique({
            where: {
                userId_tenantId: {
                    userId: createBuildingDto.ownerId,
                    tenantId: createBuildingDto.tenantId
                }
            }
        });
        if (!userTenant) {
            throw new common_1.ForbiddenException('User does not have access to this tenant');
        }
        const userSubscription = await this.prisma.subscription.findUnique({
            where: { userId: createBuildingDto.ownerId },
        });
        const propertyCount = await this.prisma.property.count({
            where: {
                tenantId: createBuildingDto.tenantId,
                ownerId: createBuildingDto.ownerId
            },
        });
        if (userSubscription && propertyCount >= userSubscription.maxProperties) {
            throw new common_1.ForbiddenException(`Límite de propiedades alcanzado. Tu plan permite máximo ${userSubscription.maxProperties} propiedades.`);
        }
        return this.prisma.property.create({
            data: {
                name: createBuildingDto.name,
                address: createBuildingDto.address,
                city: createBuildingDto.city,
                ownerId: createBuildingDto.ownerId,
                tenantId: createBuildingDto.tenantId,
                settings: createBuildingDto.settings || {
                    currency: 'ARS',
                    language: 'es',
                    expenseCalculation: 'area_based'
                }
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                tenant: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            },
        });
    }
    async findAllByTenant(tenantId) {
        return this.prisma.property.findMany({
            where: {
                tenantId,
                isActive: true
            },
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
    async findOne(id, tenantId) {
        const property = await this.prisma.property.findFirst({
            where: {
                id,
                tenantId,
                isActive: true
            },
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
                    where: { isOccupied: true },
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
        if (!property) {
            throw new common_1.NotFoundException('Property not found in this tenant');
        }
        return property;
    }
    async update(id, updateBuildingDto, tenantId) {
        await this.verifyPropertyExists(id, tenantId);
        try {
            return await this.prisma.property.update({
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
                    tenant: {
                        select: {
                            id: true,
                            name: true,
                        }
                    }
                },
            });
        }
        catch {
            throw new common_1.NotFoundException('Property not found');
        }
    }
    async remove(id, tenantId) {
        await this.verifyPropertyExists(id, tenantId);
        try {
            return await this.prisma.property.update({
                where: { id },
                data: { isActive: false },
            });
        }
        catch {
            throw new common_1.NotFoundException('Property not found');
        }
    }
    async getPropertyStats(id, tenantId) {
        await this.verifyPropertyExists(id, tenantId);
        const [totalUnits, occupiedUnits, activeTickets, pendingExpenses, monthlyRevenue, totalResidents,] = await Promise.all([
            this.prisma.unit.count({
                where: {
                    propertyId: id,
                    isOccupied: true
                }
            }),
            this.prisma.unit.count({
                where: {
                    propertyId: id,
                    isOccupied: true,
                }
            }),
            this.prisma.ticket.count({
                where: {
                    propertyId: id,
                    status: { in: ['OPEN', 'IN_PROGRESS'] }
                }
            }),
            this.prisma.expense.aggregate({
                where: {
                    propertyId: id,
                    status: { in: ['OPEN', 'OVERDUE'] }
                },
                _sum: { amount: true },
            }),
            this.prisma.payment.aggregate({
                where: {
                    expense: { propertyId: id },
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
                            propertyId: id,
                            isOccupied: true
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
    async verifyPropertyExists(propertyId, tenantId) {
        const property = await this.prisma.property.findFirst({
            where: {
                id: propertyId,
                tenantId,
                isActive: true
            },
        });
        if (!property) {
            throw new common_1.NotFoundException('Property not found in this tenant');
        }
        return property;
    }
    async verifyPropertyAccess(propertyId, userId, userRole, tenantId) {
        if (userRole === client_1.UserRole.SUPER_ADMIN) {
            return true;
        }
        const property = await this.prisma.property.findFirst({
            where: {
                id: propertyId,
                tenantId,
                isActive: true,
                OR: [
                    { ownerId: userId },
                    { units: { some: { managerId: userId } } },
                    { tickets: { some: { assignedToId: userId } } },
                ],
            },
        });
        if (!property) {
            throw new common_1.ForbiddenException('No tienes acceso a esta propiedad en este tenant');
        }
        return property;
    }
};
exports.BuildingsService = BuildingsService;
exports.BuildingsService = BuildingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BuildingsService);
//# sourceMappingURL=buildings.service.js.map