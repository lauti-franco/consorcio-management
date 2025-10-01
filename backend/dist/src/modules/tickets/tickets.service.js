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
exports.TicketsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../shared/database/prisma.service");
const client_1 = require("@prisma/client");
let TicketsService = class TicketsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createTicketDto, userId) {
        const property = await this.prisma.property.findFirst({
            where: {
                id: createTicketDto.propertyId,
                tenantId: createTicketDto.tenantId
            }
        });
        if (!property) {
            throw new common_1.NotFoundException('Property not found in this tenant');
        }
        if (createTicketDto.unitId) {
            const unit = await this.prisma.unit.findFirst({
                where: {
                    id: createTicketDto.unitId,
                    propertyId: createTicketDto.propertyId,
                    tenantId: createTicketDto.tenantId
                }
            });
            if (!unit) {
                throw new common_1.ForbiddenException('Unit not found in this property and tenant');
            }
        }
        if (createTicketDto.assignedTo) {
            const assignedUserTenant = await this.prisma.userTenant.findUnique({
                where: {
                    userId_tenantId: {
                        userId: createTicketDto.assignedTo,
                        tenantId: createTicketDto.tenantId
                    }
                }
            });
            if (!assignedUserTenant) {
                throw new common_1.ForbiddenException('Assigned user does not have access to this tenant');
            }
        }
        return this.prisma.ticket.create({
            data: {
                title: createTicketDto.title,
                description: createTicketDto.description,
                priority: createTicketDto.priority || client_1.Priority.MEDIUM,
                status: client_1.TicketStatus.OPEN,
                category: createTicketDto.category,
                photos: createTicketDto.photos || [],
                propertyId: createTicketDto.propertyId,
                unitId: createTicketDto.unitId,
                userId: userId,
                tenantId: createTicketDto.tenantId,
                assignedToId: createTicketDto.assignedTo,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
                assignedTo: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
                property: {
                    select: {
                        id: true,
                        name: true,
                        address: true,
                    },
                },
                unit: {
                    select: {
                        id: true,
                        number: true,
                        floor: true,
                    },
                },
            },
        });
    }
    async findAll(userId, userRole, tenantId, propertyId) {
        const where = { tenantId };
        if (userRole === client_1.UserRole.RESIDENT) {
            where.unit = {
                managerId: userId,
                tenantId: tenantId
            };
        }
        else if (userRole === client_1.UserRole.MAINTENANCE) {
            where.OR = [
                { assignedToId: userId },
                { assignedToId: null },
            ];
        }
        else if (userRole === client_1.UserRole.ADMIN) {
            if (propertyId) {
                where.propertyId = propertyId;
            }
            else {
                where.property = {
                    ownerId: userId,
                    tenantId: tenantId
                };
            }
        }
        return this.prisma.ticket.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
                assignedTo: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
                property: {
                    select: {
                        id: true,
                        name: true,
                        address: true,
                    },
                },
                unit: {
                    select: {
                        id: true,
                        number: true,
                        floor: true,
                    },
                },
            },
            orderBy: {
                priority: 'desc',
                createdAt: 'desc',
            },
        });
    }
    async findOne(id, userId, userRole, tenantId) {
        const ticket = await this.prisma.ticket.findFirst({
            where: {
                id,
                tenantId
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
                assignedTo: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
                property: {
                    select: {
                        id: true,
                        name: true,
                        address: true,
                    },
                },
                unit: {
                    select: {
                        id: true,
                        number: true,
                        floor: true,
                    },
                },
            },
        });
        if (!ticket) {
            throw new common_1.NotFoundException('Ticket not found in this tenant');
        }
        await this.verifyTicketAccess(ticket, userId, userRole, tenantId);
        return ticket;
    }
    async update(id, updateTicketDto, userId, userRole, tenantId) {
        const ticket = await this.prisma.ticket.findFirst({
            where: {
                id,
                tenantId
            },
        });
        if (!ticket) {
            throw new common_1.NotFoundException('Ticket not found in this tenant');
        }
        await this.verifyTicketAccess(ticket, userId, userRole, tenantId);
        if (updateTicketDto.assignedTo) {
            const assignedUserTenant = await this.prisma.userTenant.findUnique({
                where: {
                    userId_tenantId: {
                        userId: updateTicketDto.assignedTo,
                        tenantId: tenantId
                    }
                }
            });
            if (!assignedUserTenant) {
                throw new common_1.ForbiddenException('Assigned user does not have access to this tenant');
            }
        }
        return this.prisma.ticket.update({
            where: { id },
            data: {
                title: updateTicketDto.title,
                description: updateTicketDto.description,
                priority: updateTicketDto.priority,
                status: updateTicketDto.status,
                category: updateTicketDto.category,
                photos: updateTicketDto.photos,
                assignedToId: updateTicketDto.assignedTo,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
                assignedTo: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
                property: {
                    select: {
                        id: true,
                        name: true,
                        address: true,
                    },
                },
                unit: {
                    select: {
                        id: true,
                        number: true,
                        floor: true,
                    },
                },
            },
        });
    }
    async remove(id, userId, userRole, tenantId) {
        const ticket = await this.prisma.ticket.findFirst({
            where: {
                id,
                tenantId
            },
        });
        if (!ticket) {
            throw new common_1.NotFoundException('Ticket not found in this tenant');
        }
        if (userRole !== client_1.UserRole.ADMIN && ticket.userId !== userId) {
            throw new common_1.ForbiddenException('No tienes permisos para eliminar este ticket');
        }
        return this.prisma.ticket.delete({
            where: { id },
        });
    }
    async assignToMe(id, userId, tenantId) {
        const ticket = await this.prisma.ticket.findFirst({
            where: {
                id,
                tenantId
            },
        });
        if (!ticket) {
            throw new common_1.NotFoundException('Ticket not found in this tenant');
        }
        const userTenant = await this.prisma.userTenant.findUnique({
            where: {
                userId_tenantId: {
                    userId: userId,
                    tenantId: tenantId
                }
            }
        });
        if (!userTenant || userTenant.role !== client_1.UserRole.MAINTENANCE) {
            throw new common_1.ForbiddenException('Only maintenance users can assign tickets to themselves');
        }
        return this.prisma.ticket.update({
            where: { id },
            data: {
                assignedToId: userId,
                status: client_1.TicketStatus.IN_PROGRESS,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
                assignedTo: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
                property: {
                    select: {
                        id: true,
                        name: true,
                        address: true,
                    },
                },
                unit: {
                    select: {
                        id: true,
                        number: true,
                        floor: true,
                    },
                },
            },
        });
    }
    async completeTicket(id, userId, userRole, tenantId) {
        const ticket = await this.prisma.ticket.findFirst({
            where: {
                id,
                tenantId
            },
        });
        if (!ticket) {
            throw new common_1.NotFoundException('Ticket not found in this tenant');
        }
        await this.verifyTicketAccess(ticket, userId, userRole, tenantId);
        return this.prisma.ticket.update({
            where: { id },
            data: {
                status: client_1.TicketStatus.RESOLVED,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
                assignedTo: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
                property: {
                    select: {
                        id: true,
                        name: true,
                        address: true,
                    },
                },
                unit: {
                    select: {
                        id: true,
                        number: true,
                        floor: true,
                    },
                },
            },
        });
    }
    async addPhoto(id, photoUrl, userId, userRole, tenantId) {
        const ticket = await this.prisma.ticket.findFirst({
            where: {
                id,
                tenantId
            },
        });
        if (!ticket) {
            throw new common_1.NotFoundException('Ticket not found in this tenant');
        }
        await this.verifyTicketAccess(ticket, userId, userRole, tenantId);
        const updatedPhotos = [...ticket.photos, photoUrl];
        return this.prisma.ticket.update({
            where: { id },
            data: {
                photos: updatedPhotos,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
                assignedTo: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
                property: {
                    select: {
                        id: true,
                        name: true,
                        address: true,
                    },
                },
                unit: {
                    select: {
                        id: true,
                        number: true,
                        floor: true,
                    },
                },
            },
        });
    }
    async getStats(userId, userRole, tenantId, propertyId) {
        const where = { tenantId };
        if (userRole === client_1.UserRole.RESIDENT) {
            where.unit = {
                managerId: userId,
                tenantId: tenantId
            };
        }
        else if (userRole === client_1.UserRole.MAINTENANCE) {
            where.assignedToId = userId;
        }
        else if (userRole === client_1.UserRole.ADMIN) {
            if (propertyId) {
                where.propertyId = propertyId;
            }
            else {
                where.property = {
                    ownerId: userId,
                    tenantId: tenantId
                };
            }
        }
        const [total, open, inProgress, resolved] = await Promise.all([
            this.prisma.ticket.count({ where }),
            this.prisma.ticket.count({ where: { ...where, status: client_1.TicketStatus.OPEN } }),
            this.prisma.ticket.count({ where: { ...where, status: client_1.TicketStatus.IN_PROGRESS } }),
            this.prisma.ticket.count({ where: { ...where, status: client_1.TicketStatus.RESOLVED } }),
        ]);
        return {
            total,
            open,
            inProgress,
            resolved,
            resolvedPercentage: total > 0 ? (resolved / total) * 100 : 0,
        };
    }
    async verifyTicketAccess(ticket, userId, userRole, tenantId) {
        if (userRole === client_1.UserRole.ADMIN) {
            const property = await this.prisma.property.findFirst({
                where: {
                    id: ticket.propertyId,
                    ownerId: userId,
                    tenantId: tenantId
                },
            });
            if (!property) {
                throw new common_1.ForbiddenException('Access denied to this ticket');
            }
            return true;
        }
        if (userRole === client_1.UserRole.RESIDENT) {
            const unitAccess = await this.prisma.unit.findFirst({
                where: {
                    id: ticket.unitId,
                    managerId: userId,
                    tenantId: tenantId
                },
            });
            if (!unitAccess) {
                throw new common_1.ForbiddenException('Access denied to this ticket');
            }
            return true;
        }
        if (userRole === client_1.UserRole.MAINTENANCE) {
            if (ticket.assignedToId !== userId) {
                throw new common_1.ForbiddenException('Access denied to this ticket');
            }
            return true;
        }
        throw new common_1.ForbiddenException('Access denied to this ticket');
    }
};
exports.TicketsService = TicketsService;
exports.TicketsService = TicketsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TicketsService);
//# sourceMappingURL=tickets.service.js.map