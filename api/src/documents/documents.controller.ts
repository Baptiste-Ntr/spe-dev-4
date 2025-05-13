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
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-documents.dto';
import { isSet } from 'util/types';
import { RenameDocumentDto } from './dto/rename-document.dto';
// import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('documents')
export class DocumentsController {
  constructor(private docsService: DocumentsService) { }

  // Nécessite d'être identifié (JWT)
  // @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Req() req,
    @Body() dto: CreateDocumentDto,
  ) {
    var userId = 'dev-user-id'; // selon implémentation JWT
    // Vérifier si req.user existe avant d'essayer d'accéder à ses propriétés
    if (req.user && isSet(req.user.userId)) {
      userId = req.user.userId;
    }
    const document = await this.docsService.create(dto, userId);
    return document;
  }

  @Get()  // Ajouter cette méthode si elle n'existe pas
  findAll() {
    return this.docsService.findAll();
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
}
