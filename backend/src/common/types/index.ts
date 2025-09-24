// Tipos y enums compartidos para toda la aplicación
export enum UserRole {
  ADMIN = 'ADMIN',
  MAINTENANCE = 'MAINTENANCE',
  RESIDENT = 'RESIDENT'
}

export enum ExpenseStatus {
  OPEN = 'OPEN',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE'
}

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED'
}

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
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