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
    validateUser(payload: any): Promise<{
        id: string;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        isActive: boolean;
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
