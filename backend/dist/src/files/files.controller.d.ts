import { FilesService } from './files.service';
export declare class FilesController {
    private readonly filesService;
    constructor(filesService: FilesService);
    uploadFile(file: Express.Multer.File, req: any): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string;
        key: string;
        url: string;
        mimeType: string;
        size: number;
        uploadedBy: string;
    }>;
    findAll(req: any): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string;
        key: string;
        url: string;
        mimeType: string;
        size: number;
        uploadedBy: string;
    }[]>;
    findOne(id: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string;
        key: string;
        url: string;
        mimeType: string;
        size: number;
        uploadedBy: string;
    }>;
    remove(id: string, req: any): Promise<{
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
