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
import { JwtAuthGuard } from '../auth/jwt.auth.guard';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Controller('documents')
export class DocumentsController {
  constructor(private docsService: DocumentsService) { }

  @UseGuards(JwtAuthGuard)
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
}
