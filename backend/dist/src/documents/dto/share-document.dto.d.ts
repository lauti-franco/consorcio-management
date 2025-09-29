import { UserRole } from '@prisma/client';
export declare class ShareDocumentDto {
    userId?: string;
    role?: UserRole;
    canView: boolean;
    canEdit: boolean;
    canDelete: boolean;
}
