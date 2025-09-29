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
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DocumentsService = class DocumentsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createDocumentDto, userId, tenantId) {
        const document = await this.prisma.document.create({
            data: {
                ...createDocumentDto,
                uploadedById: userId,
                tenantId,
            },
            include: {
                uploadedBy: {
                    select: { name: true, email: true }
                },
                property: true
            }
        });
        await this.prisma.documentPermission.create({
            data: {
                documentId: document.id,
                userId: userId,
                canView: true,
                canEdit: true,
                canDelete: true
            }
        });
        return document;
    }
    async findAll(tenantId, userId, filters) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                userTenants: {
                    where: { tenantId }
                }
            }
        });
        if (!user) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        const userRole = user.userTenants[0]?.role || 'RESIDENT';
        const where = { tenantId };
        if (filters?.type)
            where.type = filters.type;
        if (filters?.propertyId)
            where.propertyId = filters.propertyId;
        if (filters?.category)
            where.category = { contains: filters.category, mode: 'insensitive' };
        if (filters?.isPublic !== undefined)
            where.isPublic = filters.isPublic;
        if (userRole === 'RESIDENT') {
            where.OR = [
                { isPublic: true },
                {
                    permissions: {
                        some: {
                            OR: [
                                { userId },
                                {
                                    role: userRole,
                                    userId: null
                                }
                            ]
                        }
                    }
                }
            ];
        }
        const documents = await this.prisma.document.findMany({
            where,
            include: {
                uploadedBy: {
                    select: { name: true, email: true }
                },
                property: true,
                permissions: {
                    include: {
                        user: {
                            select: { name: true, email: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return documents;
    }
    async findOne(id, tenantId, userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                userTenants: {
                    where: { tenantId }
                }
            }
        });
        if (!user) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        const userRole = user.userTenants[0]?.role || 'RESIDENT';
        const document = await this.prisma.document.findUnique({
            where: { id, tenantId },
            include: {
                uploadedBy: {
                    select: { name: true, email: true }
                },
                property: true,
                permissions: {
                    include: {
                        user: {
                            select: { name: true, email: true }
                        }
                    }
                }
            }
        });
        if (!document) {
            throw new common_1.NotFoundException('Documento no encontrado');
        }
        const hasAccess = await this.checkDocumentAccess(document, userId, userRole);
        if (!hasAccess) {
            throw new common_1.ForbiddenException('No tienes permisos para ver este documento');
        }
        return document;
    }
    async shareDocument(documentId, shareDocumentDto, tenantId, userId) {
        const document = await this.prisma.document.findUnique({
            where: { id: documentId, tenantId }
        });
        if (!document) {
            throw new common_1.NotFoundException('Documento no encontrado');
        }
        const userPermission = await this.prisma.documentPermission.findFirst({
            where: {
                documentId,
                userId,
                canEdit: true
            }
        });
        if (!userPermission && document.uploadedById !== userId) {
            throw new common_1.ForbiddenException('No tienes permisos para compartir este documento');
        }
        return this.prisma.documentPermission.upsert({
            where: {
                documentId_userId: {
                    documentId,
                    userId: shareDocumentDto.userId || 'NULL'
                }
            },
            create: {
                documentId,
                userId: shareDocumentDto.userId,
                role: shareDocumentDto.role,
                canView: shareDocumentDto.canView,
                canEdit: shareDocumentDto.canEdit,
                canDelete: shareDocumentDto.canDelete
            },
            update: {
                canView: shareDocumentDto.canView,
                canEdit: shareDocumentDto.canEdit,
                canDelete: shareDocumentDto.canDelete
            }
        });
    }
    async getDocumentCategories(tenantId) {
        const categories = await this.prisma.document.groupBy({
            by: ['category'],
            where: {
                tenantId,
                category: { not: null }
            },
            _count: {
                id: true
            }
        });
        return categories.map(cat => ({
            name: cat.category,
            count: cat._count.id
        }));
    }
    async getDocumentStats(tenantId) {
        const [totalCount, byType, recentUploads] = await Promise.all([
            this.prisma.document.count({ where: { tenantId } }),
            this.prisma.document.groupBy({
                by: ['type'],
                where: { tenantId },
                _count: { id: true }
            }),
            this.prisma.document.findMany({
                where: { tenantId },
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    uploadedBy: {
                        select: { name: true }
                    }
                }
            })
        ]);
        return {
            totalCount,
            byType: byType.reduce((acc, item) => {
                acc[item.type] = item._count.id;
                return acc;
            }, {}),
            recentUploads
        };
    }
    async checkDocumentAccess(document, userId, userRole) {
        if (document.isPublic || document.uploadedById === userId) {
            return true;
        }
        const permission = await this.prisma.documentPermission.findFirst({
            where: {
                documentId: document.id,
                OR: [
                    { userId },
                    {
                        role: userRole,
                        userId: null
                    }
                ]
            }
        });
        return permission?.canView || false;
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map