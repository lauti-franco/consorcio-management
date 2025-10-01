import { FilesService } from './files.service';
export declare class FilesController {
    private readonly filesService;
    constructor(filesService: FilesService);
    uploadFile(file: Express.Multer.File, req: any): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string;
        mimeType: string;
        uploadedBy: string;
        key: string;
        url: string;
        size: number;
    }>;
    findAll(req: any): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string;
        mimeType: string;
        uploadedBy: string;
        key: string;
        url: string;
        size: number;
    }[]>;
    findOne(id: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string;
        mimeType: string;
        uploadedBy: string;
        key: string;
        url: string;
        size: number;
    }>;
    remove(id: string, req: any): Promise<{
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
