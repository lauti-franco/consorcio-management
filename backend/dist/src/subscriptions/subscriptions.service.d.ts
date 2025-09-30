import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
export declare class SubscriptionsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createSubscriptionDto: CreateSubscriptionDto, userId: string): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
        };
    } & {
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
    }>;
    findAll(userId: string): Promise<({
        user: {
            id: string;
            name: string;
            email: string;
        };
    } & {
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
    })[]>;
    findOne(id: string, userId: string): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
        };
    } & {
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
    }>;
    update(id: string, updateSubscriptionDto: UpdateSubscriptionDto, userId: string): Promise<{
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
    }>;
    remove(id: string, userId: string): Promise<{
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
    }>;
}
