export declare class ValidationUtils {
    static validateEmail(email: string): boolean;
    static validatePassword(password: string): void;
    static validateFileType(mimeType: string, allowedTypes: string[]): boolean;
    static validateFileSize(size: number, maxSize: number): boolean;
}
