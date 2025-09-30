import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
export declare class FilesService {
    private prisma;
    private configService;
    constructor(prisma: PrismaService, configService: ConfigService);
    uploadFile(file: Express.Multer.File, userId: string, tenantId: string): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string;
        key: string;
        url: string;
        mimeType: string;
        size: number;
        uploadedBy: string;
    }>;
    findAll(userId: string, tenantId: string): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string;
        key: string;
        url: string;
        mimeType: string;
        size: number;
        uploadedBy: string;
    }[]>;
    findOne(id: string, userId: string, tenantId: string): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string;
        key: string;
        url: string;
        mimeType: string;
        size: number;
        uploadedBy: string;
    }>;
    remove(id: string, userId: string, tenantId: string): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string;
        key: string;
        url: string;
        mimeType: string;
        size: number;
        uploadedBy: string;
    }>;
}
