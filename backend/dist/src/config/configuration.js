"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('config', () => {
    return {
        database: {
            url: process.env.DATABASE_URL,
        },
        jwt: {
            secret: process.env.JWT_SECRET,
            refreshSecret: process.env.JWT_REFRESH_SECRET,
            expiresIn: '15m',
            refreshExpiresIn: '7d',
        },
        app: {
            port: parseInt(process.env.PORT, 10) || 3000,
            env: process.env.NODE_ENV || 'development',
            prefix: process.env.API_PREFIX || '/api',
        },
        upload: {
            maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10485760,
            path: process.env.UPLOAD_PATH || './uploads',
            allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
        },
        cors: {
            frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5353',
        },
    };
});
//# sourceMappingURL=configuration.js.map