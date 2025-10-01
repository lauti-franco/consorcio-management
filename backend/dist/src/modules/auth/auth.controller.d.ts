import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        message: string;
        data: {
            tenantId: string;
            accessToken: string;
            refreshToken: string;
            expiresIn: string;
            user: {
                id: string;
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                email: string;
                role: import(".prisma/client").$Enums.UserRole;
                phone: string;
                avatar: string;
                emailVerified: boolean;
            };
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        message: string;
        data: {
            tenantId: string;
            accessToken: string;
            refreshToken: string;
            expiresIn: string;
            user: {
                userTenants: ({
                    tenant: {
                        id: string;
                        name: string;
                        description: string;
                    };
                } & {
                    id: string;
                    role: import(".prisma/client").$Enums.UserRole;
                    userId: string;
                    tenantId: string;
                })[];
                subscription: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    userId: string;
                    plan: import(".prisma/client").$Enums.PlanType;
                    status: import(".prisma/client").$Enums.SubscriptionStatus;
                    stripeSubscriptionId: string | null;
                    stripeCustomerId: string | null;
                    currentPeriodStart: Date | null;
                    currentPeriodEnd: Date | null;
                    cancelAtPeriodEnd: boolean;
                    maxProperties: number;
                    maxUsers: number;
                    features: import("@prisma/client/runtime/library").JsonValue;
                };
                ownedProperties: {
                    id: string;
                    name: string;
                    tenantId: string;
                }[];
                managedUnits: ({
                    property: {
                        id: string;
                        name: string;
                        tenantId: string;
                    };
                } & {
                    number: string;
                    id: string;
                    tenantId: string;
                    features: string[];
                    floor: number;
                    type: import(".prisma/client").$Enums.UnitType;
                    area: number | null;
                    bedrooms: number | null;
                    bathrooms: number | null;
                    isOccupied: boolean;
                    propertyId: string;
                    managerId: string | null;
                })[];
                id: string;
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                email: string;
                role: import(".prisma/client").$Enums.UserRole;
                phone: string | null;
                avatar: string | null;
                emailVerified: boolean;
                lastLogin: Date | null;
            };
        };
    }>;
    refresh(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresIn: string;
    }>;
    logout(req: any): Promise<{
        message: string;
    }>;
    changePassword(req: any, currentPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
    validateToken(req: any): Promise<{
        valid: boolean;
        user: {
            id: any;
            email: any;
            name: any;
            role: any;
        };
    }>;
}
