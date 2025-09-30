import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
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
    validateUser(payload: any): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        subscription: {
            plan: import(".prisma/client").$Enums.PlanType;
            status: import(".prisma/client").$Enums.SubscriptionStatus;
            features: import("@prisma/client/runtime/library").JsonValue;
        };
    }>;
    refreshTokens(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresIn: string;
    }>;
    logout(userId: string): Promise<{
        message: string;
    }>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
    private generateTokens;
    private generateRandomToken;
}
