import { PrismaService } from '../../shared/database/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { ShareDocumentDto } from './dto/share-document.dto';
export declare class DocumentsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createDocumentDto: CreateDocumentDto, userId: string, tenantId: string): Promise<{
        property: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            address: string;
            city: string;
            settings: import("@prisma/client/runtime/library").JsonValue;
            ownerId: string;
        };
        uploadedBy: {
            name: string;
            email: string;
        };
    } & {
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        type: import(".prisma/client").$Enums.DocumentType;
        propertyId: string | null;
        title: string;
        category: string | null;
        fileName: string;
        fileUrl: string;
        fileSize: number;
        mimeType: string;
        isPublic: boolean;
        version: string;
        isArchived: boolean;
        uploadedById: string;
    }>;
    findAll(tenantId: string, userId: string, filters?: {
        type?: string;
        propertyId?: string;
        category?: string;
        isPublic?: boolean;
    }): Promise<({
        property: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            address: string;
            city: string;
            settings: import("@prisma/client/runtime/library").JsonValue;
            ownerId: string;
        };
        uploadedBy: {
            name: string;
            email: string;
        };
        permissions: ({
            user: {
                name: string;
                email: string;
            };
        } & {
            id: string;
            role: import(".prisma/client").$Enums.UserRole | null;
            userId: string | null;
            canView: boolean;
            canEdit: boolean;
            canDelete: boolean;
            documentId: string;
        })[];
    } & {
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        type: import(".prisma/client").$Enums.DocumentType;
        propertyId: string | null;
        title: string;
        category: string | null;
        fileName: string;
        fileUrl: string;
        fileSize: number;
        mimeType: string;
        isPublic: boolean;
        version: string;
        isArchived: boolean;
        uploadedById: string;
    })[]>;
    findOne(id: string, tenantId: string, userId: string): Promise<{
        property: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            address: string;
            city: string;
            settings: import("@prisma/client/runtime/library").JsonValue;
            ownerId: string;
        };
        uploadedBy: {
            name: string;
            email: string;
        };
        permissions: ({
            user: {
                name: string;
                email: string;
            };
        } & {
            id: string;
            role: import(".prisma/client").$Enums.UserRole | null;
            userId: string | null;
            canView: boolean;
            canEdit: boolean;
            canDelete: boolean;
            documentId: string;
        })[];
    } & {
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        type: import(".prisma/client").$Enums.DocumentType;
        propertyId: string | null;
        title: string;
        category: string | null;
        fileName: string;
        fileUrl: string;
        fileSize: number;
        mimeType: string;
        isPublic: boolean;
        version: string;
        isArchived: boolean;
        uploadedById: string;
    }>;
    shareDocument(documentId: string, shareDocumentDto: ShareDocumentDto, tenantId: string, userId: string): Promise<{
        id: string;
        role: import(".prisma/client").$Enums.UserRole | null;
        userId: string | null;
        canView: boolean;
        canEdit: boolean;
        canDelete: boolean;
        documentId: string;
    }>;
    getDocumentCategories(tenantId: string): Promise<{
        name: string;
        count: number;
    }[]>;
    getDocumentStats(tenantId: string): Promise<{
        totalCount: number;
        byType: {};
        recentUploads: ({
            uploadedBy: {
                name: string;
            };
        } & {
            id: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            type: import(".prisma/client").$Enums.DocumentType;
            propertyId: string | null;
            title: string;
            category: string | null;
            fileName: string;
            fileUrl: string;
            fileSize: number;
            mimeType: string;
            isPublic: boolean;
            version: string;
            isArchived: boolean;
            uploadedById: string;
        })[];
    }>;
    private checkDocumentAccess;
}
