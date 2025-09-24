declare const _default: (() => {
    database: {
        url: string;
    };
    jwt: {
        secret: string;
        refreshSecret: string;
        expiresIn: string;
        refreshExpiresIn: string;
    };
    app: {
        port: number;
        env: string;
        prefix: string;
    };
    upload: {
        maxFileSize: number;
        path: string;
        allowedMimeTypes: string[];
    };
    cors: {
        frontendUrl: string;
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    database: {
        url: string;
    };
    jwt: {
        secret: string;
        refreshSecret: string;
        expiresIn: string;
        refreshExpiresIn: string;
    };
    app: {
        port: number;
        env: string;
        prefix: string;
    };
    upload: {
        maxFileSize: number;
        path: string;
        allowedMimeTypes: string[];
    };
    cors: {
        frontendUrl: string;
    };
}>;
export default _default;
