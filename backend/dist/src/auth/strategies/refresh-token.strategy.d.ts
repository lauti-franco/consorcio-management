import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
declare const RefreshTokenStrategy_base: new (...args: any[]) => import("passport").Strategy & import("passport").StrategyCreatedStatic;
export declare class RefreshTokenStrategy extends RefreshTokenStrategy_base {
    private prisma;
    constructor(prisma: PrismaService);
    validate(req: Request): Promise<any>;
}
export {};
