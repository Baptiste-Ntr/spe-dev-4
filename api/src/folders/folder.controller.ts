import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Logger } from '@nestjs/common';
import { FoldersService } from './folder.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard';
import { ShareFolderDto } from './dto/share-folder.dto';

@Controller('folders')
@UseGuards(JwtAuthGuard) // Protection de toutes les routes
export class FolderController {
  private readonly logger = new Logger(FolderController.name);

  constructor(
    private readonly foldersService: FoldersService,
  ) { }

  // Création d'un dossier
  @Post()
  async create(@Body() createFolderDto: CreateFolderDto, @Req() req) {
    this.logger.log(`Creating folder: ${createFolderDto.name}`);
    const folder = await this.foldersService.create(createFolderDto, req.user.userId);

    return folder;
  }

  // Récupération de tous les dossiers de l'utilisateur
  @Get()
  findAll(@Req() req) {
    this.logger.debug(`Getting all folders for user ${req.user?.userId}`);
    return this.foldersService.findAll(req.user.userId);
  }

  // Récupére un dossier par son ID lier à l'utilisateur
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.foldersService.findOne(id, req.user.userId);
  }

  // Update d'un dossier
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFolderDto: UpdateFolderDto, @Req() req) {
    return this.foldersService.update(id, updateFolderDto, req.user.userId);
  }

  // Supression d'un dossier
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.foldersService.remove(id, req.user.userId);
  }

  // To do : Partager un dossier
  @Post(':id/share')
  shareFolder(
    @Param('id') id: string,
    @Body() shareDto: ShareFolderDto,
    @Req() req
  ) {
    return this.foldersService.shareFolder(id, shareDto.userId, shareDto.canEdit, req.user.userId);
  }
}