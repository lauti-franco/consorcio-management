"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const path_1 = require("path");
const app_module_1 = require("./app.module");
const config_1 = require("@nestjs/config");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('config.app.port');
    const prefix = configService.get('config.app.prefix');
    const frontendUrl = configService.get('config.cors.frontendUrl');
    app.setGlobalPrefix(prefix);
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'uploads'), {
        prefix: '/uploads/',
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.enableCors({
        origin: function (origin, callback) {
            if (!origin)
                return callback(null, true);
            const allowedOrigins = [
                'http://localhost:3000',
                'http://127.0.0.1:3000',
                'http://localhost:5353',
                'http://127.0.0.1:5353',
                'http://localhost:59487',
                'http://127.0.0.1:59487',
                'http://localhost:8080',
                'http://127.0.0.1:8080',
                'http://localhost',
            ];
            if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.localhost')) {
                callback(null, true);
            }
            else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'Accept',
            'Origin',
            'X-Requested-With',
            'X-Request-ID',
            'Access-Control-Allow-Headers'
        ],
        exposedHeaders: [
            'Authorization',
            'Access-Control-Allow-Origin'
        ],
        credentials: true,
        preflightContinue: false,
        optionsSuccessStatus: 204,
        maxAge: 86400
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Consorcio Management API')
        .setDescription('API for building management system')
        .setVersion('1.0')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
    }, 'JWT-auth')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('docs', app, document);
    await app.listen(port);
    console.log(`🚀 Application is running on: http://localhost:${port}/${prefix}`);
    console.log(`📚 Swagger documentation: http://localhost:${port}/docs`);
    console.log(`📁 Files served from: http://localhost:${port}/uploads/`);
}
bootstrap();
//# sourceMappingURL=main.js.map