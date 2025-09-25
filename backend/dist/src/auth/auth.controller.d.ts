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
    refresh(req: any): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(req: any): Promise<{
        message: string;
    }>;
}
