"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const fs_1 = require("fs");
const path_1 = require("path");
const config_1 = require("@nestjs/config");
let FilesService = class FilesService {
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
    }
    async uploadFile(file, userId, tenantId) {
        if (!file) {
            throw new common_1.BadRequestException('No file provided');
        }
        const uploadPath = this.configService.get('config.upload.path') || './uploads';
        const fileName = `${Date.now()}-${file.originalname}`;
        const filePath = (0, path_1.join)(uploadPath, fileName);
        const fs = require('fs');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        const writeStream = (0, fs_1.createWriteStream)(filePath);
        writeStream.write(file.buffer);
        writeStream.end();
        const fileRecord = await this.prisma.file.create({
            data: {
                key: fileName,
                url: `/uploads/${fileName}`,
                mimeType: file.mimetype,
                size: file.size,
                uploadedBy: userId,
                tenantId: tenantId,
            },
        });
        return fileRecord;
    }
    async findAll(userId, tenantId) {
        return this.prisma.file.findMany({
            where: {
                uploadedBy: userId,
                tenantId: tenantId
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async findOne(id, userId, tenantId) {
        return this.prisma.file.findFirst({
            where: {
                id,
                uploadedBy: userId,
                tenantId: tenantId
            },
        });
    }
    async remove(id, userId, tenantId) {
        const file = await this.prisma.file.findFirst({
            where: {
                id,
                uploadedBy: userId,
                tenantId: tenantId
            },
        });
        if (!file) {
            throw new common_1.BadRequestException('File not found');
        }
        const fs = require('fs');
        const uploadPath = this.configService.get('config.upload.path') || './uploads';
        const filePath = (0, path_1.join)(uploadPath, file.key);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        return this.prisma.file.delete({
            where: { id },
        });
    }
};
exports.FilesService = FilesService;
exports.FilesService = FilesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], FilesService);
//# sourceMappingURL=files.service.js.map