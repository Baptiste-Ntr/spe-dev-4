// src/documents/documents.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  Patch,
  Delete,
  UseInterceptors,
  UploadedFile,
  Logger,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-documents.dto';
import { isSet } from 'util/types';
import { RenameDocumentDto } from './dto/rename-document.dto';
import { JwtAuthGuard } from '../auth/jwt.auth.guard';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common/exceptions';
import { PrismaService } from '../prisma/prisma.service';
import { DocumentType } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
  private readonly logger = new Logger(DocumentsController.name);

  constructor(private docsService: DocumentsService,
    private readonly prisma: PrismaService,
  ) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Req() req,
    @Body() dto: CreateDocumentDto,
  ) {
    const userId = req.user.userId;

    const document = await this.docsService.create(dto, userId);
    return document;
  }

  @Get()
  findAll() {
    return this.docsService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.docsService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDocumentDto,
  ) {
    return this.docsService.update(id, dto);
  }

  @Patch(':id')
  rename(
    @Param('id') id: string,
    @Body() dto: RenameDocumentDto,
  ) {
    return this.docsService.rename(id, dto.title);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.docsService.remove(id);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: 'uploads/files',
      filename: (_, file, cb) => {
        const name = `${uuidv4()}${extname(file.originalname)}`;
        cb(null, name);
      },
    }),
    fileFilter: (_, file, cb) => {
      // autorise pdf, png, jpeg, ...
      if (/pdf|jpe?g|png/.test(file.mimetype)) cb(null, true);
      else cb(new BadRequestException('Type non supporté'), false);
    },
    limits: { fileSize: 100 * 1024 * 1024 }, // 100 Mo max
  }))
  async upload(
    @UploadedFile() file: any, // Utiliser 'any' pour éviter l'erreur de type Express.Multer.File
    @Body('title') title: string,
    @Body('folderId') folderId: string, // Ajouter ce paramètre
    @Req() req
  ) {

    const userId = req.user.userId;
    let myFileType: DocumentType = DocumentType.TEXT;
    const fileTypeGlobal = file.mimetype.split('/')[0].toUpperCase();
    const fileTypeExtension = file.mimetype.split('/')[1].toUpperCase();

    if (fileTypeGlobal === 'IMAGE') {
      myFileType = DocumentType.IMAGE;
    } else if (fileTypeGlobal === 'APPLICATION') {
      if (fileTypeExtension === 'PDF') {
        myFileType = DocumentType.PDF;
      } else {
        this.logger.error(`Type de fichier non supporté: ${file.mimetype}`);
        throw new BadRequestException('Type de fichier non supporté');
      }
    }

    // Utiliser un dossier par défaut si folderId n'est pas fourni
    const folderIdToUse = folderId || process.env.ROOT_FOLDER_ID || 'default-folder';

    const doc = await this.prisma.document.create({
      data: {
        title,
        filePath: file.filename,
        mimeType: file.mimetype,
        type: myFileType,
        // Utiliser la relation avec updatedBy au lieu de updatedById
        updatedBy: {
          connect: {
            id: userId
          }
        },
        // Ajouter la relation avec folder
        folder: {
          connect: {
            id: folderIdToUse
          }
        }
      },
      // Inclure les informations de folder dans la réponse
      include: {
        folder: true,
        updatedBy: true
      }
    });
    this.logger.debug(`Document créé avec succès: ${doc.id}`);
    return doc;
  }

}
