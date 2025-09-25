import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('config.app.port');
  const prefix = configService.get<string>('config.app.prefix');
  const frontendUrl = configService.get<string>('config.cors.frontendUrl');

  app.setGlobalPrefix(prefix);
  
  // Servir archivos estáticos
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

 // En src/main.ts - CONFIGURACIÓN CORS COMPLETA
app.enableCors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (como mobile apps o algunos navegadores)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:5353',
      'http://127.0.0.1:5353',
      'http://localhost:59487',
      'http://127.0.0.1:59487',
      'http://localhost:8080',
      'http://127.0.0.1:8080',
      'http://localhost', // Sin puerto
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.localhost')) {
      callback(null, true);
    } else {
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
  maxAge: 86400 // 24 horas
});

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Consorcio Management API')
    .setDescription('API for building management system')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}/${prefix}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/docs`);
  console.log(`📁 Files served from: http://localhost:${port}/uploads/`);
}

bootstrap();