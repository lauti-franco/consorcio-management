export declare enum UserRole {
    ADMIN = "ADMIN",
    MAINTENANCE = "MAINTENANCE",
    RESIDENT = "RESIDENT"
}
export declare enum ExpenseStatus {
    OPEN = "OPEN",
    PAID = "PAID",
    OVERDUE = "OVERDUE"
}
export declare enum TicketStatus {
    OPEN = "OPEN",
    IN_PROGRESS = "IN_PROGRESS",
    RESOLVED = "RESOLVED"
}
export declare enum TaskStatus {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export interface JwtPayload {
    userId: string;
    email: string;
    role: UserRole;
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}
