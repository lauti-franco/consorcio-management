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
    async findAll(currentUserId, currentUserRole, tenantId, role, propertyId) {
        const where = {};
        if (role) {
            where.role = role;
        }
        if (currentUserRole === client_1.UserRole.RESIDENT) {
            where.userTenants = {
                some: {
                    tenantId: tenantId,
                    role: client_1.UserRole.RESIDENT
                }
            };
            where.managedUnits = {
                some: {
                    property: {
                        units: {
                            some: {
                                managerId: currentUserId,
                            },
                        },
                    },
                    tenantId: tenantId
                },
            };
        }
        else if (currentUserRole === client_1.UserRole.ADMIN) {
            where.userTenants = {
                some: {
                    tenantId: tenantId
                }
            };
            where.OR = [
                { ownedProperties: { some: { ownerId: currentUserId, tenantId: tenantId } } },
                { managedUnits: { some: { property: { ownerId: currentUserId, tenantId: tenantId } } } },
            ];
        }
        else if (currentUserRole === client_1.UserRole.MAINTENANCE) {
            where.userTenants = {
                some: {
                    tenantId: tenantId
                }
            };
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
                ownedProperties: {
                    where: { tenantId: tenantId },
                    select: {
                        id: true,
                        name: true,
                    },
                },
                managedUnits: {
                    where: { tenantId: tenantId },
                    select: {
                        id: true,
                        number: true,
                        property: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
                userTenants: {
                    where: { tenantId: tenantId },
                    select: {
                        role: true,
                        tenant: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            },
        });
    }
    async findOne(id, currentUserId, currentUserRole, tenantId) {
        await this.verifyUserAccess(id, currentUserId, currentUserRole, tenantId);
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
                ownedProperties: {
                    where: { tenantId: tenantId },
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
                    where: { tenantId: tenantId },
                    select: {
                        id: true,
                        number: true,
                        floor: true,
                        type: true,
                        area: true,
                        property: {
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
                userTenants: {
                    where: { tenantId: tenantId },
                    select: {
                        role: true,
                        tenant: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async update(id, updateData, currentUserId, currentUserRole, tenantId) {
        await this.verifyUserAccess(id, currentUserId, currentUserRole, tenantId);
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
    async deactivate(id, currentUserId, currentUserRole, tenantId) {
        if (id === currentUserId) {
            throw new common_1.ForbiddenException('No puedes desactivar tu propia cuenta');
        }
        await this.verifyUserAccess(id, currentUserId, currentUserRole, tenantId);
        try {
            await this.prisma.userTenant.update({
                where: {
                    userId_tenantId: {
                        userId: id,
                        tenantId: tenantId
                    }
                },
                data: { role: client_1.UserRole.RESIDENT }
            });
            return {
                message: 'Usuario desactivado del tenant exitosamente',
                userId: id,
                tenantId: tenantId
            };
        }
        catch {
            throw new common_1.NotFoundException('User not found in this tenant');
        }
    }
    async remove(id, currentUserId, currentUserRole, tenantId) {
        if (id === currentUserId) {
            throw new common_1.ForbiddenException('No puedes eliminar tu propia cuenta');
        }
        if (currentUserRole !== client_1.UserRole.SUPER_ADMIN) {
            throw new common_1.ForbiddenException('Solo los super administradores pueden eliminar usuarios del tenant');
        }
        await this.verifyUserAccess(id, currentUserId, currentUserRole, tenantId);
        try {
            return await this.prisma.userTenant.delete({
                where: {
                    userId_tenantId: {
                        userId: id,
                        tenantId: tenantId
                    }
                }
            });
        }
        catch {
            throw new common_1.NotFoundException('User not found in this tenant');
        }
    }
    async getUserStats(userId, tenantId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                ownedProperties: {
                    where: { tenantId: tenantId },
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
                    where: { tenantId: tenantId },
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
                        ownedProperties: {
                            where: { tenantId: tenantId }
                        },
                        managedUnits: {
                            where: { tenantId: tenantId }
                        },
                        createdTasks: {
                            where: { tenantId: tenantId }
                        },
                        assignedTasks: {
                            where: { tenantId: tenantId }
                        },
                        tickets: {
                            where: { tenantId: tenantId }
                        },
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
                ownedProperties: user._count.ownedProperties,
                managedUnits: user._count.managedUnits,
                createdTasks: user._count.createdTasks,
                assignedTasks: user._count.assignedTasks,
                tickets: user._count.tickets,
            },
            properties: user.ownedProperties.map(property => ({
                id: property.id,
                name: property.name,
                units: property._count.units,
                expenses: property._count.expenses,
                tickets: property._count.tickets,
            })),
        };
    }
    async verifyUserAccess(targetUserId, currentUserId, currentUserRole, tenantId) {
        if (currentUserRole === client_1.UserRole.SUPER_ADMIN) {
            return true;
        }
        const targetUserTenant = await this.prisma.userTenant.findUnique({
            where: {
                userId_tenantId: {
                    userId: targetUserId,
                    tenantId: tenantId
                }
            }
        });
        if (!targetUserTenant) {
            throw new common_1.ForbiddenException('El usuario no tiene acceso a este tenant');
        }
        if (currentUserRole === client_1.UserRole.ADMIN) {
            const userAccess = await this.prisma.user.findFirst({
                where: {
                    id: targetUserId,
                    userTenants: {
                        some: {
                            tenantId: tenantId
                        }
                    },
                    OR: [
                        { ownedProperties: { some: { ownerId: currentUserId, tenantId: tenantId } } },
                        { managedUnits: { some: { property: { ownerId: currentUserId, tenantId: tenantId } } } },
                    ],
                },
            });
            if (!userAccess) {
                throw new common_1.ForbiddenException('No tienes permisos para acceder a este usuario en este tenant');
            }
            return true;
        }
        if (currentUserRole === client_1.UserRole.RESIDENT) {
            if (targetUserId !== currentUserId) {
                throw new common_1.ForbiddenException('Solo puedes acceder a tu propia información en este tenant');
            }
            return true;
        }
        if (currentUserRole === client_1.UserRole.MAINTENANCE) {
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