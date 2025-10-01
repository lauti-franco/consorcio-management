// src/documents/documents.controller.ts
import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  UseGuards, 
  Req,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { ShareDocumentDto } from './dto/share-document.dto';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';

@ApiTags('documents')
@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Subir un nuevo documento' })
  async create(
    @Body() createDocumentDto: CreateDocumentDto,
    @Req() req: any,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({ fileType: '.(pdf|doc|docx|xls|xlsx|jpg|jpeg|png)' })
        ]
      })
    ) file: Express.Multer.File
  ) {
    const documentData = {
      ...createDocumentDto,
      fileName: file.originalname,
      fileUrl: `/uploads/documents/${file.filename}`,
      fileSize: file.size,
      mimeType: file.mimetype
    };

    return this.documentsService.create(
      documentData, 
      req.user.id, 
      req.tenant.id
    );
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los documentos con filtros' })
  findAll(
    @Req() req: any,
    @Query('type') type?: string,
    @Query('propertyId') propertyId?: string,
    @Query('category') category?: string,
    @Query('isPublic') isPublic?: boolean
  ) {
    return this.documentsService.findAll(
      req.tenant.id, 
      req.user.id, 
      { type, propertyId, category, isPublic }
    );
  }

  @Get('categories')
  @ApiOperation({ summary: 'Obtener categorÃ­as de documentos' })
  getCategories(@Req() req: any) {
    return this.documentsService.getDocumentCategories(req.tenant.id);
  }

  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Obtener estadÃ­sticas de documentos' })
  getStats(@Req() req: any) {
    return this.documentsService.getDocumentStats(req.tenant.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un documento especÃ­fico' })
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.documentsService.findOne(id, req.tenant.id, req.user.id);
  }

  @Post(':id/share')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Compartir documento con usuarios o roles' })
  shareDocument(
    @Param('id') id: string,
    @Body() shareDocumentDto: ShareDocumentDto,
    @Req() req: any
  ) {
    return this.documentsService.shareDocument(id, shareDocumentDto, req.tenant.id, req.user.id);
  }
}
