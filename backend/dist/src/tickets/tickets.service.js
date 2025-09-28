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
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let TicketsService = class TicketsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createTicketDto, userId) {
        return this.prisma.ticket.create({
            data: {
                title: createTicketDto.title,
                description: createTicketDto.description,
                priority: createTicketDto.priority || client_1.Priority.MEDIUM,
                status: client_1.TicketStatus.OPEN,
                category: createTicketDto.category,
                photos: createTicketDto.photos || [],
                buildingId: createTicketDto.buildingId,
                unitId: createTicketDto.unitId,
                userId: userId,
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
                building: {
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
    async findAll(userId, userRole, buildingId) {
        const where = {};
        if (userRole === client_1.UserRole.RESIDENT) {
            where.unit = {
                managerId: userId,
            };
        }
        else if (userRole === client_1.UserRole.MAINTENANCE) {
            where.OR = [
                { assignedToId: userId },
                { assignedToId: null },
            ];
        }
        else if (userRole === client_1.UserRole.ADMIN) {
            if (buildingId) {
                where.buildingId = buildingId;
            }
            else {
                where.building = {
                    ownerId: userId,
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
                building: {
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
    async findOne(id, userId, userRole) {
        const ticket = await this.prisma.ticket.findUnique({
            where: { id },
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
                building: {
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
            throw new common_1.NotFoundException('Ticket not found');
        }
        await this.verifyTicketAccess(ticket, userId, userRole);
        return ticket;
    }
    async update(id, updateTicketDto, userId, userRole) {
        const ticket = await this.prisma.ticket.findUnique({
            where: { id },
        });
        if (!ticket) {
            throw new common_1.NotFoundException('Ticket not found');
        }
        await this.verifyTicketAccess(ticket, userId, userRole);
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
                building: {
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
    async remove(id, userId, userRole) {
        const ticket = await this.prisma.ticket.findUnique({
            where: { id },
        });
        if (!ticket) {
            throw new common_1.NotFoundException('Ticket not found');
        }
        if (userRole !== client_1.UserRole.ADMIN && ticket.userId !== userId) {
            throw new common_1.ForbiddenException('No tienes permisos para eliminar este ticket');
        }
        return this.prisma.ticket.delete({
            where: { id },
        });
    }
    async assignToMe(id, userId) {
        const ticket = await this.prisma.ticket.findUnique({
            where: { id },
        });
        if (!ticket) {
            throw new common_1.NotFoundException('Ticket not found');
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
                building: {
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
    async completeTicket(id, userId, userRole) {
        const ticket = await this.prisma.ticket.findUnique({
            where: { id },
        });
        if (!ticket) {
            throw new common_1.NotFoundException('Ticket not found');
        }
        await this.verifyTicketAccess(ticket, userId, userRole);
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
                building: {
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
    async addPhoto(id, photoUrl, userId, userRole) {
        const ticket = await this.prisma.ticket.findUnique({
            where: { id },
        });
        if (!ticket) {
            throw new common_1.NotFoundException('Ticket not found');
        }
        await this.verifyTicketAccess(ticket, userId, userRole);
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
                building: {
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
    async getStats(userId, userRole, buildingId) {
        const where = {};
        if (userRole === client_1.UserRole.RESIDENT) {
            where.unit = {
                managerId: userId,
            };
        }
        else if (userRole === client_1.UserRole.MAINTENANCE) {
            where.assignedToId = userId;
        }
        else if (userRole === client_1.UserRole.ADMIN) {
            if (buildingId) {
                where.buildingId = buildingId;
            }
            else {
                where.building = {
                    ownerId: userId,
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
    async verifyTicketAccess(ticket, userId, userRole) {
        if (userRole === client_1.UserRole.ADMIN) {
            const building = await this.prisma.building.findFirst({
                where: {
                    id: ticket.buildingId,
                    ownerId: userId,
                },
            });
            if (!building) {
                throw new common_1.ForbiddenException('Access denied');
            }
            return true;
        }
        if (userRole === client_1.UserRole.RESIDENT) {
            const unitAccess = await this.prisma.unit.findFirst({
                where: {
                    id: ticket.unitId,
                    managerId: userId,
                },
            });
            if (!unitAccess) {
                throw new common_1.ForbiddenException('Access denied');
            }
            return true;
        }
        if (userRole === client_1.UserRole.MAINTENANCE) {
            if (ticket.assignedToId !== userId) {
                throw new common_1.ForbiddenException('Access denied');
            }
            return true;
        }
        throw new common_1.ForbiddenException('Access denied');
    }
};
exports.TicketsService = TicketsService;
exports.TicketsService = TicketsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TicketsService);
//# sourceMappingURL=tickets.service.js.map