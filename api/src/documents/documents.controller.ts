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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody, ApiParam } from '@nestjs/swagger';

@ApiTags('Documents')
@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
  private readonly logger = new Logger(DocumentsController.name);

  constructor(
    private docsService: DocumentsService,
    private readonly prisma: PrismaService,
  ) { }

  // Création d'un document texte
  @ApiOperation({ summary: 'Create a new document' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          example: 'Mon nouveau document'
        },
        content: {
          type: 'string',
          example: 'Contenu du document'
        },
        folderId: {
          type: 'string',
          example: '123e4567-e89b-12d3-a456-426614174000'
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Document successfully created',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          example: '123e4567-e89b-12d3-a456-426614174000'
        },
        title: {
          type: 'string',
          example: 'Mon nouveau document'
        },
        content: {
          type: 'string',
          example: 'Contenu du document'
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
          example: '2024-03-20T10:00:00Z'
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
          example: '2024-03-20T10:00:00Z'
        }
      }
    }
  })
  @ApiBearerAuth()
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
  @ApiOperation({ summary: 'Get all documents' })
  @ApiResponse({
    status: 200,
    description: 'Return all documents',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: '123e4567-e89b-12d3-a456-426614174000'
          },
          title: {
            type: 'string',
            example: 'Document 1'
          },
          content: {
            type: 'string',
            example: 'Contenu du document'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-03-20T10:00:00Z'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-03-20T10:00:00Z'
          }
        }
      }
    }
  })
  @ApiBearerAuth()
  @Get()
  findAll() {
    return this.docsService.findAll();
  }

  // Récupération de tous les documents partagés avec l'utilisateur
  @ApiOperation({ summary: 'Get shared documents' })
  @ApiResponse({
    status: 200,
    description: 'Return shared documents',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: '123e4567-e89b-12d3-a456-426614174000'
          },
          title: {
            type: 'string',
            example: 'Document partagé'
          },
          sharedBy: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                example: '123e4567-e89b-12d3-a456-426614174000'
              },
              email: {
                type: 'string',
                example: 'user@example.com'
              }
            }
          }
        }
      }
    }
  })
  @ApiBearerAuth()
  @Get('shared')
  async findSharedDocuments(@Req() req) {
    const userId = req.user.userId;
    return this.docsService.findSharedDocuments(userId);
  }

  // Récupération d'un document par son ID
  @ApiOperation({ summary: 'Get document by ID' })
  @ApiParam({
    name: 'id',
    type: 'string',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({
    status: 200,
    description: 'Return document by ID',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          example: '123e4567-e89b-12d3-a456-426614174000'
        },
        title: {
          type: 'string',
          example: 'Document 1'
        },
        content: {
          type: 'string',
          example: 'Contenu du document'
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
          example: '2024-03-20T10:00:00Z'
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
          example: '2024-03-20T10:00:00Z'
        }
      }
    }
  })
  @ApiBearerAuth()
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.docsService.findById(id);
  }

  // Modification d'un document
  @ApiOperation({ summary: 'Update document' })
  @ApiParam({
    name: 'id',
    type: 'string',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          example: 'Document mis à jour'
        },
        content: {
          type: 'string',
          example: 'Nouveau contenu du document'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Document successfully updated',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          example: '123e4567-e89b-12d3-a456-426614174000'
        },
        title: {
          type: 'string',
          example: 'Document mis à jour'
        },
        content: {
          type: 'string',
          example: 'Nouveau contenu du document'
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
          example: '2024-03-20T10:00:00Z'
        }
      }
    }
  })
  @ApiBearerAuth()
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDocumentDto,
  ) {
    return this.docsService.update(id, dto);
  }

  @ApiOperation({ summary: 'Rename document' })
  @ApiParam({
    name: 'id',
    type: 'string',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          example: 'Nouveau nom du document'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Document successfully renamed',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          example: '123e4567-e89b-12d3-a456-426614174000'
        },
        title: {
          type: 'string',
          example: 'Nouveau nom du document'
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
          example: '2024-03-20T10:00:00Z'
        }
      }
    }
  })
  @ApiBearerAuth()
  @Patch('/rename/:id')
  rename(
    @Param('rename/:id') id: string,
    @Body() dto: RenameDocumentDto,
  ) {
    return this.docsService.rename(id, dto.title);
  }

  // Suppression d'un document
  @ApiOperation({ summary: 'Delete document' })
  @ApiParam({
    name: 'id',
    type: 'string',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({
    status: 200,
    description: 'Document successfully deleted',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Document deleted successfully'
        }
      }
    }
  })
  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.docsService.remove(id);
  }

  // Upload d'un fichier
  @ApiOperation({ summary: 'Upload document file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload (PDF, PNG, JPEG)'
        },
        title: {
          type: 'string',
          example: 'Mon document'
        },
        folderId: {
          type: 'string',
          example: '123e4567-e89b-12d3-a456-426614174000'
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'File successfully uploaded',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          example: '123e4567-e89b-12d3-a456-426614174000'
        },
        title: {
          type: 'string',
          example: 'Mon document'
        },
        filePath: {
          type: 'string',
          example: 'uploads/files/document.pdf'
        },
        mimeType: {
          type: 'string',
          example: 'application/pdf'
        },
        type: {
          type: 'string',
          enum: ['TEXT', 'IMAGE', 'PDF'],
          example: 'PDF'
        }
      }
    }
  })
  @ApiBearerAuth()
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
  @ApiOperation({ summary: 'Get document collaborators' })
  @ApiParam({
    name: 'id',
    type: 'string',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({
    status: 200,
    description: 'Return document collaborators',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: '123e4567-e89b-12d3-a456-426614174000'
          },
          email: {
            type: 'string',
            example: 'user@example.com'
          },
          firstName: {
            type: 'string',
            example: 'John'
          },
          lastName: {
            type: 'string',
            example: 'Doe'
          },
          canEdit: {
            type: 'boolean',
            example: true
          }
        }
      }
    }
  })
  @ApiBearerAuth()
  @Get(':id/collaborators')
  async getDocumentCollaborators(@Param('id') id: string) {
    return this.docsService.getDocumentCollaborators(id);
  }

}
