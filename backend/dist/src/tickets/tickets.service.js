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
const types_1 = require("../common/types");
let TicketsService = class TicketsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createTicketDto, userId) {
        return this.prisma.ticket.create({
            data: {
                ...createTicketDto,
                userId,
                photos: createTicketDto.photos || [],
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        building: true,
                    },
                },
                assignedUser: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }
    async findAll(userId, userRole, buildingId) {
        const where = {};
        if (userRole === types_1.UserRole.RESIDENT) {
            where.userId = userId;
        }
        else if (userRole === types_1.UserRole.MAINTENANCE) {
            where.OR = [
                { assignedTo: userId },
                { assignedTo: null },
            ];
        }
        else if (userRole === types_1.UserRole.ADMIN && buildingId) {
            where.user = { buildingId };
        }
        return this.prisma.ticket.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        building: true,
                    },
                },
                assignedUser: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
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
                        building: true,
                    },
                },
                assignedUser: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
        if (!ticket) {
            throw new common_1.NotFoundException('Ticket not found');
        }
        if (userRole === types_1.UserRole.RESIDENT && ticket.userId !== userId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return ticket;
    }
    async update(id, updateTicketDto, userId, userRole) {
        const ticket = await this.prisma.ticket.findUnique({
            where: { id },
        });
        if (!ticket) {
            throw new common_1.NotFoundException('Ticket not found');
        }
        if (userRole === types_1.UserRole.RESIDENT && ticket.userId !== userId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        if (userRole === types_1.UserRole.MAINTENANCE && ticket.assignedTo !== userId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return this.prisma.ticket.update({
            where: { id },
            data: updateTicketDto,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        building: true,
                    },
                },
                assignedUser: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
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
        if (userRole === types_1.UserRole.RESIDENT && ticket.userId !== userId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        if (userRole !== types_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('Only admins can delete tickets');
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
                assignedTo: userId,
                status: 'IN_PROGRESS',
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        building: true,
                    },
                },
                assignedUser: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }
    async addPhoto(id, photoUrl, userId) {
        const ticket = await this.prisma.ticket.findUnique({
            where: { id },
        });
        if (!ticket) {
            throw new common_1.NotFoundException('Ticket not found');
        }
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
                        building: true,
                    },
                },
                assignedUser: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }
    async getStats() {
        const total = await this.prisma.ticket.count();
        const open = await this.prisma.ticket.count({ where: { status: 'OPEN' } });
        const inProgress = await this.prisma.ticket.count({ where: { status: 'IN_PROGRESS' } });
        const resolved = await this.prisma.ticket.count({ where: { status: 'RESOLVED' } });
        return {
            total,
            open,
            inProgress,
            resolved,
            resolvedPercentage: total > 0 ? (resolved / total) * 100 : 0,
        };
    }
};
exports.TicketsService = TicketsService;
exports.TicketsService = TicketsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TicketsService);
//# sourceMappingURL=tickets.service.js.map