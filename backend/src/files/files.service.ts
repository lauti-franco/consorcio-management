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

  async uploadFile(file: Express.Multer.File, userId: string) {
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

    // Guardar metadata en base de datos
    const fileRecord = await this.prisma.file.create({
      data: {
        key: fileName,
        url: `/uploads/${fileName}`,
        mimeType: file.mimetype,
        size: file.size,
        uploadedBy: userId,
      },
    });

    return fileRecord;
  }

  async findAll(userId: string) {
    return this.prisma.file.findMany({
      where: { uploadedBy: userId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, userId: string) {
    return this.prisma.file.findFirst({
      where: {
        id,
        uploadedBy: userId,
      },
    });
  }

  async remove(id: string, userId: string) {
    const file = await this.prisma.file.findFirst({
      where: {
        id,
        uploadedBy: userId,
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