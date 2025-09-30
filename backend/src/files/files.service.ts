import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FilesService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async uploadFile(file: Express.Multer.File, userId: string, tenantId: string) {
    // AGREGADO: tenantId como parámetro
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const uploadPath = this.configService.get<string>('config.upload.path') || './uploads';
    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = join(uploadPath, fileName);

    // Crear directorio si no existe
    const fs = require('fs');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    // Guardar archivo localmente
    const writeStream = createWriteStream(filePath);
    writeStream.write(file.buffer);
    writeStream.end();

    // Guardar metadata en base de datos - CORREGIDO con tenantId
    const fileRecord = await this.prisma.file.create({
      data: {
        key: fileName,
        url: `/uploads/${fileName}`,
        mimeType: file.mimetype,
        size: file.size,
        uploadedBy: userId,
        tenantId: tenantId, // AGREGADO: tenantId requerido
      },
    });

    return fileRecord;
  }

  async findAll(userId: string, tenantId: string) {
    // AGREGADO: tenantId como parámetro
    return this.prisma.file.findMany({
      where: { 
        uploadedBy: userId,
        tenantId: tenantId // AGREGADO: filtrar por tenant
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, userId: string, tenantId: string) {
    // AGREGADO: tenantId como parámetro
    return this.prisma.file.findFirst({
      where: {
        id,
        uploadedBy: userId,
        tenantId: tenantId // AGREGADO: filtrar por tenant
      },
    });
  }

  async remove(id: string, userId: string, tenantId: string) {
    // AGREGADO: tenantId como parámetro
    const file = await this.prisma.file.findFirst({
      where: {
        id,
        uploadedBy: userId,
        tenantId: tenantId // AGREGADO: filtrar por tenant
      },
    });

    if (!file) {
      throw new BadRequestException('File not found');
    }

    // Eliminar archivo físico
    const fs = require('fs');
    const uploadPath = this.configService.get<string>('config.upload.path') || './uploads';
    const filePath = join(uploadPath, file.key);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return this.prisma.file.delete({
      where: { id },
    });
  }
}