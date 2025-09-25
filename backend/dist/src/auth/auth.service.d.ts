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
            user: {
                id: string;
                name: string;
                createdAt: Date;
                email: string;
                role: import(".prisma/client").$Enums.UserRole;
                updatedAt: Date;
                buildingId: string;
            };
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        message: string;
        data: {
            accessToken: string;
            refreshToken: string;
            user: {
                building: {
                    id: string;
                    name: string;
                    address: string;
                    city: string;
                    createdAt: Date;
                };
                id: string;
                name: string;
                createdAt: Date;
                email: string;
                role: import(".prisma/client").$Enums.UserRole;
                updatedAt: Date;
                buildingId: string | null;
            };
        };
    }>;
    refreshTokens(userId: string, refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: string): Promise<{
        message: string;
    }>;
    private generateTokens;
    private generateRandomToken;
}
