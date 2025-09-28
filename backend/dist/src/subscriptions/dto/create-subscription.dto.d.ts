import { PlanType, SubscriptionStatus } from '@prisma/client';
export declare class CreateSubscriptionDto {
    plan: PlanType;
    status?: SubscriptionStatus;
    features?: object;
}
