import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';

@Injectable()
export class FoldersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    try {
    return this.prisma.folder.findMany({
      include: {
        documents: {
          select: { id: true, title: true },
        },
        children: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    }); 
}
    catch (error) {
      throw new NotFoundException('Error fetching folders');
    }
  }

  async findOne(id: string) {
    const folder = await this.prisma.folder.findUnique({
      where: { id },
      include: {
        documents: { select: { id: true, title: true } },
        children: { select: { id: true, name: true } },
      },
    });
    if (!folder) throw new NotFoundException(`Folder ${id} not found`);
    return folder;
  }

  async create(dto: CreateFolderDto) {
    if (dto.parentId) {
      const parent = await this.prisma.folder.findUnique({ where: { id: dto.parentId } });
      if (!parent) throw new NotFoundException(`Parent folder ${dto.parentId} not found`);
    }
    return this.prisma.folder.create({ data: dto });
  }

  async update(id: string, dto: UpdateFolderDto) {
    await this.findOne(id);
    if (dto.parentId) {
      const parent = await this.prisma.folder.findUnique({ where: { id: dto.parentId } });
      if (!parent) throw new NotFoundException(`Parent folder ${dto.parentId} not found`);
    }
    return this.prisma.folder.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.folder.delete({ where: { id } });
  }
}