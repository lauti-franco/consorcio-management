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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(currentUserId, currentUserRole, role, buildingId) {
        const where = {};
        if (role) {
            where.role = role;
        }
        if (currentUserRole === client_1.UserRole.RESIDENT) {
            where.managedUnits = {
                some: {
                    building: {
                        units: {
                            some: {
                                managerId: currentUserId,
                            },
                        },
                    },
                },
            };
        }
        else if (currentUserRole === client_1.UserRole.ADMIN) {
            where.OR = [
                { ownedBuildings: { some: { ownerId: currentUserId } } },
                { managedUnits: { some: { building: { ownerId: currentUserId } } } },
            ];
        }
        return this.prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                avatar: true,
                isActive: true,
                emailVerified: true,
                lastLogin: true,
                createdAt: true,
                updatedAt: true,
                subscription: {
                    select: {
                        plan: true,
                        status: true,
                        currentPeriodEnd: true,
                    },
                },
                ownedBuildings: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                managedUnits: {
                    select: {
                        id: true,
                        number: true,
                        building: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });
    }
    async findOne(id, currentUserId, currentUserRole) {
        await this.verifyUserAccess(id, currentUserId, currentUserRole);
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                avatar: true,
                isActive: true,
                emailVerified: true,
                lastLogin: true,
                createdAt: true,
                updatedAt: true,
                subscription: {
                    select: {
                        id: true,
                        plan: true,
                        status: true,
                        currentPeriodStart: true,
                        currentPeriodEnd: true,
                        features: true,
                    },
                },
                ownedBuildings: {
                    select: {
                        id: true,
                        name: true,
                        address: true,
                        _count: {
                            select: {
                                units: true,
                                expenses: true,
                                tickets: true,
                            },
                        },
                    },
                },
                managedUnits: {
                    select: {
                        id: true,
                        number: true,
                        floor: true,
                        type: true,
                        area: true,
                        building: {
                            select: {
                                id: true,
                                name: true,
                                address: true,
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
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async update(id, updateData, currentUserId, currentUserRole) {
        await this.verifyUserAccess(id, currentUserId, currentUserRole);
        try {
            return await this.prisma.user.update({
                where: { id },
                data: updateData,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    phone: true,
                    avatar: true,
                    isActive: true,
                    emailVerified: true,
                    lastLogin: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
        }
        catch {
            throw new common_1.NotFoundException('User not found');
        }
    }
    async deactivate(id, currentUserId, currentUserRole) {
        if (id === currentUserId) {
            throw new common_1.ForbiddenException('No puedes desactivar tu propia cuenta');
        }
        await this.verifyUserAccess(id, currentUserId, currentUserRole);
        try {
            return await this.prisma.user.update({
                where: { id },
                data: { isActive: false },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    isActive: true,
                },
            });
        }
        catch {
            throw new common_1.NotFoundException('User not found');
        }
    }
    async remove(id, currentUserId, currentUserRole) {
        if (id === currentUserId) {
            throw new common_1.ForbiddenException('No puedes eliminar tu propia cuenta');
        }
        if (currentUserRole !== client_1.UserRole.SUPER_ADMIN) {
            throw new common_1.ForbiddenException('Solo los super administradores pueden eliminar usuarios');
        }
        await this.verifyUserAccess(id, currentUserId, currentUserRole);
        try {
            return await this.prisma.user.delete({
                where: { id },
            });
        }
        catch {
            throw new common_1.NotFoundException('User not found');
        }
    }
    async getUserStats(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                ownedBuildings: {
                    include: {
                        _count: {
                            select: {
                                units: true,
                                expenses: true,
                                tickets: true,
                            },
                        },
                    },
                },
                managedUnits: {
                    include: {
                        _count: {
                            select: {
                                expenses: true,
                                payments: true,
                                tickets: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        ownedBuildings: true,
                        managedUnits: true,
                        createdTasks: true,
                        assignedTasks: true,
                        tickets: true,
                    },
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            stats: {
                ownedBuildings: user._count.ownedBuildings,
                managedUnits: user._count.managedUnits,
                createdTasks: user._count.createdTasks,
                assignedTasks: user._count.assignedTasks,
                tickets: user._count.tickets,
            },
            buildings: user.ownedBuildings.map(building => ({
                id: building.id,
                name: building.name,
                units: building._count.units,
                expenses: building._count.expenses,
                tickets: building._count.tickets,
            })),
        };
    }
    async verifyUserAccess(targetUserId, currentUserId, currentUserRole) {
        if (currentUserRole === client_1.UserRole.SUPER_ADMIN) {
            return true;
        }
        if (currentUserRole === client_1.UserRole.ADMIN) {
            const userAccess = await this.prisma.user.findFirst({
                where: {
                    id: targetUserId,
                    OR: [
                        { ownedBuildings: { some: { ownerId: currentUserId } } },
                        { managedUnits: { some: { building: { ownerId: currentUserId } } } },
                    ],
                },
            });
            if (!userAccess) {
                throw new common_1.ForbiddenException('No tienes permisos para acceder a este usuario');
            }
            return true;
        }
        if (currentUserRole === client_1.UserRole.RESIDENT) {
            if (targetUserId !== currentUserId) {
                throw new common_1.ForbiddenException('Solo puedes acceder a tu propia información');
            }
            return true;
        }
        throw new common_1.ForbiddenException('Access denied');
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map