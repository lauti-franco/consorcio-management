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
const client_1 = require("@prisma/client");
let TasksService = class TasksService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createTaskDto, userId) {
        return this.prisma.task.create({
            data: {
                title: createTaskDto.title,
                description: createTaskDto.description,
                priority: createTaskDto.priority,
                status: createTaskDto.status || 'PENDING',
                dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
                photos: createTaskDto.photos || [],
                buildingId: createTaskDto.buildingId,
                assignedToId: createTaskDto.assignedTo,
                createdById: userId,
            },
            include: {
                assignedTo: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                building: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
    }
    async findAll(userId, userRole) {
        const where = {};
        if (userRole === client_1.UserRole.MAINTENANCE) {
            where.assignedToId = userId;
        }
        else if (userRole === client_1.UserRole.RESIDENT) {
            where.building = {
                units: {
                    some: {
                        managerId: userId,
                    },
                },
            };
        }
        return this.prisma.task.findMany({
            where,
            include: {
                assignedTo: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                building: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                dueDate: 'asc',
            },
        });
    }
    async findOne(id, userId, userRole) {
        const task = await this.prisma.task.findUnique({
            where: { id },
            include: {
                assignedTo: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                building: {
                    select: {
                        id: true,
                        name: true,
                        address: true,
                    },
                },
            },
        });
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        await this.verifyTaskAccess(task, userId, userRole);
        return task;
    }
    async update(id, updateTaskDto, userId, userRole) {
        const task = await this.prisma.task.findUnique({
            where: { id },
        });
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        await this.verifyTaskAccess(task, userId, userRole);
        try {
            return await this.prisma.task.update({
                where: { id },
                data: {
                    title: updateTaskDto.title,
                    description: updateTaskDto.description,
                    priority: updateTaskDto.priority,
                    status: updateTaskDto.status,
                    dueDate: updateTaskDto.dueDate ? new Date(updateTaskDto.dueDate) : null,
                    photos: updateTaskDto.photos,
                    assignedToId: updateTaskDto.assignedTo,
                },
                include: {
                    assignedTo: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    createdBy: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    building: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });
        }
        catch {
            throw new common_1.NotFoundException('Task not found');
        }
    }
    async remove(id, userId, userRole) {
        const task = await this.prisma.task.findUnique({
            where: { id },
        });
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        if (userRole !== client_1.UserRole.ADMIN && task.createdById !== userId) {
            throw new common_1.ForbiddenException('No tienes permisos para eliminar esta tarea');
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
    async addPhoto(id, photoUrl, userId, userRole) {
        const task = await this.prisma.task.findUnique({
            where: { id },
        });
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        await this.verifyTaskAccess(task, userId, userRole);
        const updatedPhotos = [...task.photos, photoUrl];
        return this.prisma.task.update({
            where: { id },
            data: {
                photos: updatedPhotos,
            },
            include: {
                assignedTo: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }
    async completeTask(id, userId, userRole) {
        const task = await this.prisma.task.findUnique({
            where: { id },
        });
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        if (userRole !== client_1.UserRole.ADMIN && task.assignedToId !== userId) {
            throw new common_1.ForbiddenException('No tienes permisos para completar esta tarea');
        }
        return this.prisma.task.update({
            where: { id },
            data: {
                status: 'COMPLETED',
            },
            include: {
                assignedTo: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }
    async verifyTaskAccess(task, userId, userRole) {
        if (userRole === client_1.UserRole.ADMIN) {
            return true;
        }
        if (userRole === client_1.UserRole.MAINTENANCE && task.assignedToId !== userId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        if (userRole === client_1.UserRole.RESIDENT) {
            const userBuildingAccess = await this.prisma.unit.findFirst({
                where: {
                    managerId: userId,
                    buildingId: task.buildingId,
                },
            });
            if (!userBuildingAccess) {
                throw new common_1.ForbiddenException('Access denied');
            }
        }
        return true;
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map