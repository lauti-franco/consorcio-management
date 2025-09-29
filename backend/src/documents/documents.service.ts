// src/documents/documents.service.ts - VERSIÓN COMPLETAMENTE CORREGIDA
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { ShareDocumentDto } from './dto/share-document.dto';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async create(createDocumentDto: CreateDocumentDto, userId: string, tenantId: string) {
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

    // Crear permiso por defecto para el uploader
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

  async findAll(tenantId: string, userId: string, filters?: {
    type?: string;
    propertyId?: string;
    category?: string;
    isPublic?: boolean;
  }) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userTenants: {
          where: { tenantId }
        }
      }
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const userRole = user.userTenants[0]?.role || 'RESIDENT';

    const where: any = { tenantId };

    if (filters?.type) where.type = filters.type;
    if (filters?.propertyId) where.propertyId = filters.propertyId;
    if (filters?.category) where.category = { contains: filters.category, mode: 'insensitive' };
    if (filters?.isPublic !== undefined) where.isPublic = filters.isPublic;

    // Para residentes, solo mostrar documentos públicos o con permisos
    if (userRole === 'RESIDENT') {
      where.OR = [
        { isPublic: true },
        { 
          permissions: {
            some: {
              OR: [
                { userId },
                { 
                  role: userRole as any, // CORREGIDO
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

  async findOne(id: string, tenantId: string, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userTenants: {
          where: { tenantId }
        }
      }
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
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
      throw new NotFoundException('Documento no encontrado');
    }

    // Verificar permisos
    const hasAccess = await this.checkDocumentAccess(document, userId, userRole);
    if (!hasAccess) {
      throw new ForbiddenException('No tienes permisos para ver este documento');
    }

    return document;
  }

  async shareDocument(documentId: string, shareDocumentDto: ShareDocumentDto, tenantId: string, userId: string) {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId, tenantId }
    });

    if (!document) {
      throw new NotFoundException('Documento no encontrado');
    }

    // Verificar que el usuario tiene permisos para compartir
    const userPermission = await this.prisma.documentPermission.findFirst({
      where: {
        documentId,
        userId,
        canEdit: true
      }
    });

    if (!userPermission && document.uploadedById !== userId) {
      throw new ForbiddenException('No tienes permisos para compartir este documento');
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
        role: shareDocumentDto.role as any, // CORREGIDO
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

  async getDocumentCategories(tenantId: string) {
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

  async getDocumentStats(tenantId: string) {
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

  private async checkDocumentAccess(document: any, userId: string, userRole: string): Promise<boolean> {
    // Si es público o el uploader
    if (document.isPublic || document.uploadedById === userId) {
      return true;
    }

    // Verificar permisos específicos - CORREGIDO
    const permission = await this.prisma.documentPermission.findFirst({
      where: {
        documentId: document.id,
        OR: [
          { userId },
          { 
            role: userRole as any, // CORREGIDO
            userId: null 
          }
        ]
      }
    });

    return permission?.canView || false;
  }
}