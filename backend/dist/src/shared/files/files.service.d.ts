import { PrismaService } from '../../shared/database/prisma.service';
import { ConfigService } from '@nestjs/config';
export declare class FilesService {
    private prisma;
    private configService;
    constructor(prisma: PrismaService, configService: ConfigService);
    uploadFile(file: Express.Multer.File, userId: string, tenantId: string): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string;
        mimeType: string;
        uploadedBy: string;
        key: string;
        url: string;
        size: number;
    }>;
    findAll(userId: string, tenantId: string): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string;
        mimeType: string;
        uploadedBy: string;
        key: string;
        url: string;
        size: number;
    }[]>;
    findOne(id: string, userId: string, tenantId: string): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string;
        mimeType: string;
        uploadedBy: string;
        key: string;
        url: string;
        size: number;
    }>;
    remove(id: string, userId: string, tenantId: string): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string;
        mimeType: string;
        uploadedBy: string;
        key: string;
        url: string;
        size: number;
    }>;
}
