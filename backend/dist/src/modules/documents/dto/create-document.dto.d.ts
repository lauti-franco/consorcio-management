export declare enum DocumentType {
    REGULATION = "REGULATION",
    MEETING_MINUTES = "MEETING_MINUTES",
    CONTRACT = "CONTRACT",
    FINANCIAL_STATEMENT = "FINANCIAL_STATEMENT",
    MAINTENANCE_REPORT = "MAINTENANCE_REPORT",
    INSURANCE = "INSURANCE",
    BUDGET = "BUDGET",
    OTHER = "OTHER"
}
export declare class CreateDocumentDto {
    title: string;
    description?: string;
    type: DocumentType;
    category?: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    isPublic?: boolean;
    propertyId?: string;
}
