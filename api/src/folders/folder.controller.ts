import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { FoldersService } from './folder.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard';
import { ShareFolderDto } from './dto/share-folder.dto';

@Controller('folders')
@UseGuards(JwtAuthGuard) // Protection de toutes les routes
export class FolderController {
  constructor(private readonly foldersService: FoldersService) {}

  @Post()
  create(@Body() createFolderDto: CreateFolderDto, @Req() req) {
    return this.foldersService.create(createFolderDto, req.user.id);
  }

  @Get()
  findAll(@Req() req) {
    return this.foldersService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.foldersService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFolderDto: UpdateFolderDto, @Req() req) {
    return this.foldersService.update(id, updateFolderDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.foldersService.remove(id, req.user.id);
  }
  
  @Post(':id/share')
  shareFolder(
    @Param('id') id: string, 
    @Body() shareDto: ShareFolderDto, 
    @Req() req
  ) {
    return this.foldersService.shareFolder(id, shareDto.userId, shareDto.canEdit, req.user.id);
  }
}