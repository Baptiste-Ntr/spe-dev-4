import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class FoldersService {
  constructor(private readonly prisma: PrismaService) { }

  // Récupération de tous les dossiers de l'utilisateur
  async findAll(userId: string) {
    try {      
      const ownedFolders = await this.prisma.folder.findMany({
        where: { ownerId: userId },
        include: {
          documents: {
            select: { id: true, title: true, updatedBy: true, createdAt: true, updatedAt: true, type: true },
          },
          children: {
            select: { id: true, name: true },
          },
          sharedWith: true,
        },
        orderBy: { createdAt: 'asc' },
      });

      // Récupérer les dossiers partagés avec l'utilisateur
      const sharedFolders = await this.prisma.folder.findMany({
        where: {
          sharedWith: {
            some: { userId }
          }
        },
        include: {
          documents: {
            select: { id: true, title: true },
          },
          children: {
            select: { id: true, name: true },
          },
          sharedWith: {
            where: { userId }
          }
        },
        orderBy: { createdAt: 'asc' },
      });

      // Combiner les deux résultats
      return [...ownedFolders, ...sharedFolders];
    }
    catch (error) {
      throw new NotFoundException('Error fetching folders');
    }
  }

  // Récupération d'un dossier par son ID
  async findOne(id: string, userId: string) {
    const folder = await this.prisma.folder.findUnique({
      where: { id },
      include: {
        documents: { select: { id: true, title: true } },
        children: { select: { id: true, name: true } },
        sharedWith: true,
      },
    });

    if (!folder) throw new NotFoundException(`Folder ${id} not found`);

    // Vérifier l'accès
    if (folder.ownerId !== userId && !folder.sharedWith.some(share => share.userId === userId)) {
      throw new ForbiddenException('You do not have access to this folder');
    }

    return folder;
  }

  // Création d'un dossier
  async create(dto: CreateFolderDto, userId: string) {

    const data: Prisma.FolderCreateInput = {
      name: dto.name,
      parent: dto.parentId ? {
        connect: { id: dto.parentId }
      } : undefined,
      owner: {
        connect: { id: userId }
      }
    };

    return this.prisma.folder.create({ data });
  }

  // Modification d'un dossier
  async update(id: string, dto: UpdateFolderDto, userId: string) {
    const folder = await this.prisma.folder.findUnique({
      where: { id },
      include: { sharedWith: true }
    });

    if (!folder) throw new NotFoundException(`Folder ${id} not found`);

    const canEdit =
      folder.ownerId === userId ||
      folder.sharedWith.some(share => share.userId === userId && share.canEdit);

    if (!canEdit) {
      throw new ForbiddenException('You do not have permission to update this folder');
    }

    return this.prisma.folder.update({ where: { id }, data: dto });
  }

  // Suppression d'un dossier
  async remove(id: string, userId: string) {
    const folder = await this.prisma.folder.findUnique({
      where: { id },
      include: { children: true }
    });

    if (!folder) throw new NotFoundException(`Folder ${id} not found`);

    if (folder.ownerId !== userId) {
      throw new ForbiddenException('Only the owner can delete a folder');
    }

    // Transaction pour supprimer proprement
    return this.prisma.$transaction(async (tx) => {
      // Supprimer d'abord les partages
      await tx.folderShare.deleteMany({ where: { folderId: id } });

      // Puis supprimer les documents et leurs autorisations
      const documents = await tx.document.findMany({
        where: { folderId: id },
        select: { id: true }
      });

      for (const doc of documents) {
        await tx.permission.deleteMany({ where: { documentId: doc.id } });
      }

      await tx.document.deleteMany({ where: { folderId: id } });

      // Enfin supprimer le dossier
      return tx.folder.delete({ where: { id } });
    });
  }

  // Ajouter un partage de dossier
  async shareFolder(folderId: string, targetUserId: string, canEdit: boolean, ownerId: string) {
    const folder = await this.prisma.folder.findUnique({ where: { id: folderId } });

    if (!folder) throw new NotFoundException(`Folder ${folderId} not found`);
    if (folder.ownerId !== ownerId) {
      throw new ForbiddenException('Only the owner can share this folder');
    }

    return this.prisma.folderShare.create({
      data: {
        folder: { connect: { id: folderId } },
        user: { connect: { id: targetUserId } },
        canEdit
      }
    });
  }

}