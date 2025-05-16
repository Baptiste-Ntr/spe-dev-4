import { Controller, Post, Body, UseGuards, Req, HttpCode, HttpStatus, Get, Param, Patch, Delete, UseInterceptors, UploadedFile, Logger, } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-documents.dto';
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

  constructor(
    private docsService: DocumentsService,
    private readonly prisma: PrismaService,
  ) { }

  // Création d'un document texte
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

  // Récupération de tous les documents
  @Get()
  findAll() {
    return this.docsService.findAll();
  }

  // Récupération de tous les documents partagés avec l'utilisateur
  @Get('shared')
  async findSharedDocuments(@Req() req) {
    const userId = req.user.userId;
    return this.docsService.findSharedDocuments(userId);
  }

  // Récupération d'un document par son ID
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.docsService.findById(id);
  }

  // Modification d'un document
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDocumentDto,
  ) {
    return this.docsService.update(id, dto);
  }

  // Renommer un document
  @Patch('/rename/:id')
  rename(
    @Param('id') id: string,
    @Body() dto: RenameDocumentDto,
  ) {
    return this.docsService.rename(id, dto.title);
  }

  // Suppression d'un document
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.docsService.remove(id);
  }

  // Upload d'un fichier
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: 'uploads/files',
      filename: (_, file, cb) => {
        // Générer un nom de fichier unique
        const name = `${uuidv4()}${extname(file.originalname)}`;
        cb(null, name);
      },
    }),
    // Limiter le type de fichier
    fileFilter: (_, file, cb) => {
      // autorise pdf, png, jpeg, ...
      if (/pdf|jpe?g|png/.test(file.mimetype)) cb(null, true);
      else cb(new BadRequestException('Type non supporté'), false);
    },
    limits: { fileSize: 100 * 1024 * 1024 },
  }))
  async upload(
    @UploadedFile() file: any,
    @Body('title') title: string,
    @Body('folderId') folderId: string,
    @Req() req
  ) {

    const userId = req.user.userId;
    let myFileType: DocumentType = DocumentType.TEXT;
    // Récupérer le type de fichier à partir du mimeType
    const fileTypeGlobal = file.mimetype.split('/')[0].toUpperCase();
    const fileTypeExtension = file.mimetype.split('/')[1].toUpperCase();

    // Si le type de fichier est image/png ou image/jpeg
    // on le considère comme un document de type IMAGE
    if (fileTypeGlobal === 'IMAGE') {
      myFileType = DocumentType.IMAGE;
    } 
    // Si le type de fichier est application/pdf
    // on le considère comme un document de type PDF
    else if (fileTypeGlobal === 'APPLICATION') {
      if (fileTypeExtension === 'PDF') {
        myFileType = DocumentType.PDF;
      } else {
        this.logger.error(`Type de fichier non supporté: ${file.mimetype}`);
        throw new BadRequestException('Type de fichier non supporté');
      }
    }

    // Utiliser un dossier par défaut si folderId n'est pas fourni
    const folderIdToUse = folderId;

    const doc = await this.prisma.document.create({
      data: {
        title,
        filePath: file.filename,
        mimeType: file.mimetype,
        type: myFileType,
        updatedBy: {
          connect: {
            id: userId
          }
        },
        folder: {
          connect: {
            id: folderIdToUse
          }
        }
      },
      include: {
        folder: true,
        updatedBy: true
      }
    });
    this.logger.debug(`Document créé avec succès: ${doc.id}`);
    return doc;
  }

  // Récupératiion des personnes qui ont accès à un document
  @Get(':id/collaborators')
  async getDocumentCollaborators(@Param('id') id: string) {
    return this.docsService.getDocumentCollaborators(id);
  }

}
