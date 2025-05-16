import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Logger } from '@nestjs/common';
import { FoldersService } from './folder.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard';
import { ShareFolderDto } from './dto/share-folder.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('Folders')
@Controller('folders')
@UseGuards(JwtAuthGuard) // Protection de toutes les routes
export class FolderController {
  private readonly logger = new Logger(FolderController.name);

  constructor(
    private readonly foldersService: FoldersService,
  ) { }

  @ApiOperation({ summary: 'Create new folder' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          example: 'Mon dossier'
        },
        parentId: {
          type: 'string',
          example: '123e4567-e89b-12d3-a456-426614174000'
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Folder successfully created',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          example: '123e4567-e89b-12d3-a456-426614174000'
        },
        name: {
          type: 'string',
          example: 'Mon dossier'
        },
        parentId: {
          type: 'string',
          example: '123e4567-e89b-12d3-a456-426614174000'
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
  async create(@Body() createFolderDto: CreateFolderDto, @Req() req) {
    this.logger.log(`Creating folder: ${createFolderDto.name}`);
    const folder = await this.foldersService.create(createFolderDto, req.user.userId);

    return folder;
  }

  @ApiOperation({ summary: 'Get all folders' })
  @ApiResponse({
    status: 200,
    description: 'Return all folders',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: '123e4567-e89b-12d3-a456-426614174000'
          },
          name: {
            type: 'string',
            example: 'Mon dossier'
          },
          parentId: {
            type: 'string',
            example: '123e4567-e89b-12d3-a456-426614174000'
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
  findAll(@Req() req) {
    this.logger.debug(`Getting all folders for user ${req.user?.userId}`);
    return this.foldersService.findAll(req.user.userId);
  }

  @ApiOperation({ summary: 'Get folder by ID' })
  @ApiParam({
    name: 'id',
    type: 'string',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({
    status: 200,
    description: 'Return folder by ID',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          example: '123e4567-e89b-12d3-a456-426614174000'
        },
        name: {
          type: 'string',
          example: 'Mon dossier'
        },
        parentId: {
          type: 'string',
          example: '123e4567-e89b-12d3-a456-426614174000'
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
  findOne(@Param('id') id: string, @Req() req) {
    return this.foldersService.findOne(id, req.user.userId);
  }

  @ApiOperation({ summary: 'Update folder' })
  @ApiParam({
    name: 'id',
    type: 'string',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          example: 'Mon dossier mis à jour'
        },
        parentId: {
          type: 'string',
          example: '123e4567-e89b-12d3-a456-426614174000'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Folder successfully updated',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          example: '123e4567-e89b-12d3-a456-426614174000'
        },
        name: {
          type: 'string',
          example: 'Mon dossier mis à jour'
        },
        parentId: {
          type: 'string',
          example: '123e4567-e89b-12d3-a456-426614174000'
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
  update(@Param('id') id: string, @Body() updateFolderDto: UpdateFolderDto, @Req() req) {
    return this.foldersService.update(id, updateFolderDto, req.user.userId);
  }

  @ApiOperation({ summary: 'Delete folder' })
  @ApiParam({
    name: 'id',
    type: 'string',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({
    status: 200,
    description: 'Folder successfully deleted',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Folder deleted successfully'
        }
      }
    }
  })
  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.foldersService.remove(id, req.user.userId);
  }

  @ApiOperation({ summary: 'Share folder with user' })
  @ApiParam({
    name: 'id',
    type: 'string',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          example: '123e4567-e89b-12d3-a456-426614174000'
        },
        canEdit: {
          type: 'boolean',
          example: true
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Folder successfully shared',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          example: '123e4567-e89b-12d3-a456-426614174000'
        },
        sharedWith: {
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
        },
        canEdit: {
          type: 'boolean',
          example: true
        }
      }
    }
  })
  @ApiBearerAuth()
  @Post(':id/share')
  shareFolder(
    @Param('id') id: string,
    @Body() shareDto: ShareFolderDto,
    @Req() req
  ) {
    return this.foldersService.shareFolder(id, shareDto.userId, shareDto.canEdit, req.user.userId);
  }
}