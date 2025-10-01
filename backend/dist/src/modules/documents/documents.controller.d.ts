import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { ShareDocumentDto } from './dto/share-document.dto';
export declare class DocumentsController {
    private readonly documentsService;
    constructor(documentsService: DocumentsService);
    create(createDocumentDto: CreateDocumentDto, req: any, file: Express.Multer.File): Promise<{
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
    findAll(req: any, type?: string, propertyId?: string, category?: string, isPublic?: boolean): Promise<({
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
    getCategories(req: any): Promise<{
        name: string;
        count: number;
    }[]>;
    getStats(req: any): Promise<{
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
    findOne(id: string, req: any): Promise<{
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
    shareDocument(id: string, shareDocumentDto: ShareDocumentDto, req: any): Promise<{
        id: string;
        role: import(".prisma/client").$Enums.UserRole | null;
        userId: string | null;
        canView: boolean;
        canEdit: boolean;
        canDelete: boolean;
        documentId: string;
    }>;
}
