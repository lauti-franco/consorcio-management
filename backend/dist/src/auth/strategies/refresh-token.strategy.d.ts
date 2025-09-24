declare const RefreshTokenStrategy_base: new (...args: any[]) => import("passport").Strategy & import("passport").StrategyCreatedStatic;
export declare class RefreshTokenStrategy extends RefreshTokenStrategy_base {
    constructor();
    validate(req: any): Promise<any>;
}
export {};
