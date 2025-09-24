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
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const types_1 = require("../common/types");
let TasksService = class TasksService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createTaskDto, userId) {
        return this.prisma.task.create({
            data: {
                ...createTaskDto,
                createdBy: userId,
                photos: createTaskDto.photos || [],
                dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
            },
            include: {
                assignedUser: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                createdUser: {
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
        const where = {};
        if (userRole === types_1.UserRole.MAINTENANCE) {
            where.assignedTo = userId;
        }
        return this.prisma.task.findMany({
            where,
            include: {
                assignedUser: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                createdUser: {
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
        const task = await this.prisma.task.findUnique({
            where: { id },
            include: {
                assignedUser: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                createdUser: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        if (userRole === types_1.UserRole.MAINTENANCE && task.assignedTo !== userId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return task;
    }
    async update(id, updateTaskDto, userId, userRole) {
        const task = await this.prisma.task.findUnique({
            where: { id },
        });
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        if (userRole === types_1.UserRole.MAINTENANCE && task.assignedTo !== userId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        try {
            return await this.prisma.task.update({
                where: { id },
                data: {
                    ...updateTaskDto,
                    dueDate: updateTaskDto.dueDate ? new Date(updateTaskDto.dueDate) : null,
                },
                include: {
                    assignedUser: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    createdUser: {
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
            throw new common_1.NotFoundException('Task not found');
        }
    }
    async remove(id, userId) {
        const task = await this.prisma.task.findUnique({
            where: { id },
        });
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        try {
            return await this.prisma.task.delete({
                where: { id },
            });
        }
        catch {
            throw new common_1.NotFoundException('Task not found');
        }
    }
    async addPhoto(id, photoUrl, userId) {
        const task = await this.prisma.task.findUnique({
            where: { id },
        });
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        const updatedPhotos = [...task.photos, photoUrl];
        return this.prisma.task.update({
            where: { id },
            data: {
                photos: updatedPhotos,
            },
            include: {
                assignedUser: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                createdUser: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map