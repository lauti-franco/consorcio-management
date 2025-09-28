import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        message: string;
        data: {
            accessToken: string;
            refreshToken: string;
            expiresIn: string;
            user: {
                id: string;
                name: string;
                email: string;
                role: import(".prisma/client").$Enums.UserRole;
                phone: string;
                avatar: string;
                isActive: boolean;
                emailVerified: boolean;
                createdAt: Date;
                updatedAt: Date;
            };
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        message: string;
        data: {
            accessToken: string;
            refreshToken: string;
            expiresIn: string;
            user: {
                subscription: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    plan: import(".prisma/client").$Enums.PlanType;
                    status: import(".prisma/client").$Enums.SubscriptionStatus;
                    stripeSubscriptionId: string | null;
                    stripeCustomerId: string | null;
                    currentPeriodStart: Date | null;
                    currentPeriodEnd: Date | null;
                    cancelAtPeriodEnd: boolean;
                    maxBuildings: number;
                    maxUsers: number;
                    features: import("@prisma/client/runtime/library").JsonValue;
                    userId: string;
                };
                ownedBuildings: {
                    id: string;
                    name: string;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    address: string;
                    city: string;
                    settings: import("@prisma/client/runtime/library").JsonValue;
                    ownerId: string;
                }[];
                managedUnits: ({
                    building: {
                        id: string;
                        name: string;
                        isActive: boolean;
                        createdAt: Date;
                        updatedAt: Date;
                        address: string;
                        city: string;
                        settings: import("@prisma/client/runtime/library").JsonValue;
                        ownerId: string;
                    };
                } & {
                    number: string;
                    id: string;
                    features: string[];
                    floor: number;
                    type: import(".prisma/client").$Enums.UnitType;
                    area: number;
                    bedrooms: number | null;
                    bathrooms: number | null;
                    isOccupied: boolean;
                    buildingId: string;
                    managerId: string | null;
                })[];
                id: string;
                name: string;
                email: string;
                role: import(".prisma/client").$Enums.UserRole;
                phone: string | null;
                avatar: string | null;
                isActive: boolean;
                emailVerified: boolean;
                lastLogin: Date | null;
                createdAt: Date;
                updatedAt: Date;
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
