import { Controller, Get, Post, Param, Delete, UseGuards, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';

@ApiTags('files')
@Controller('files')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a file' })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @ApiResponse({ status: 400, description: 'No file provided' })
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any
  ) {
    // Obtener tenantId del usuario autenticado
    const tenantId = req.user.tenantId || req.user.userTenants?.[0]?.tenantId;
    
    if (!tenantId) {
      throw new Error('Tenant ID not found for user');
    }

    return this.filesService.uploadFile(file, req.user.id, tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user files' })
  findAll(@Req() req: any) {
    // Obtener tenantId del usuario autenticado
    const tenantId = req.user.tenantId || req.user.userTenants?.[0]?.tenantId;
    
    if (!tenantId) {
      throw new Error('Tenant ID not found for user');
    }

    return this.filesService.findAll(req.user.id, tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get file by ID' })
  findOne(@Param('id') id: string, @Req() req: any) {
    // Obtener tenantId del usuario autenticado
    const tenantId = req.user.tenantId || req.user.userTenants?.[0]?.tenantId;
    
    if (!tenantId) {
      throw new Error('Tenant ID not found for user');
    }

    return this.filesService.findOne(id, req.user.id, tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete file' })
  remove(@Param('id') id: string, @Req() req: any) {
    // Obtener tenantId del usuario autenticado
    const tenantId = req.user.tenantId || req.user.userTenants?.[0]?.tenantId;
    
    if (!tenantId) {
      throw new Error('Tenant ID not found for user');
    }

    return this.filesService.remove(id, req.user.id, tenantId);
  }
}
