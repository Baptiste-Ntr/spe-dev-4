import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class FoldersService {
  constructor(private readonly prisma: PrismaService) { }

  async findAll(userId: string) {
    try {
      // Récupérer les dossiers que l'utilisateur possède
      const ownedFolders = await this.prisma.folder.findMany({
        where: { ownerId: userId },
        include: {
          documents: {
            select: { id: true, title: true },
          },
          children: {
            select: { id: true, name: true },
          },
          sharedWith: true, // Pour voir avec qui le dossier est partagé
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
            where: { userId } // Uniquement les infos de partage pour cet utilisateur
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

  async findOne(id: string, userId: string) {
    // Vérifier si l'utilisateur a accès à ce dossier
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

  async create(dto: CreateFolderDto, userId: string) {
  // Vérifier si le parent existe et si l'utilisateur y a accès
  if (dto.parentId) {
    await this.checkFolderAccess(dto.parentId, userId);
  }

  // Utiliser la syntaxe explicite des types Prisma pour éviter les erreurs
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

  async update(id: string, dto: UpdateFolderDto, userId: string) {
    // Vérifier si l'utilisateur est le propriétaire
    const folder = await this.prisma.folder.findUnique({
      where: { id },
      include: { sharedWith: true }
    });

    if (!folder) throw new NotFoundException(`Folder ${id} not found`);

    // Vérifier si l'utilisateur peut modifier ce dossier
    const canEdit =
      folder.ownerId === userId ||
      folder.sharedWith.some(share => share.userId === userId && share.canEdit);

    if (!canEdit) {
      throw new ForbiddenException('You do not have permission to update this folder');
    }

    // Vérifier si le nouveau parent existe
    if (dto.parentId) {
      const parent = await this.prisma.folder.findUnique({ where: { id: dto.parentId } });
      if (!parent) throw new NotFoundException(`Parent folder ${dto.parentId} not found`);

      // Vérifier que le déplacement est autorisé (pas de cycle)
      // await this.checkFolderCycle(id, dto.parentId);
    }

    return this.prisma.folder.update({ where: { id }, data: dto });
  }

  async remove(id: string, userId: string) {
    // Vérifier si l'utilisateur est le propriétaire
    const folder = await this.prisma.folder.findUnique({
      where: { id },
      include: { children: true }
    });

    if (!folder) throw new NotFoundException(`Folder ${id} not found`);

    if (folder.ownerId !== userId) {
      throw new ForbiddenException('Only the owner can delete a folder');
    }

    // Empêcher la suppression s'il y a des sous-dossiers
    if (folder.children.length > 0) {
      throw new ForbiddenException('Cannot delete folder with subfolders');
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
    // Vérifier que l'utilisateur actuel est propriétaire
    const folder = await this.prisma.folder.findUnique({ where: { id: folderId } });

    if (!folder) throw new NotFoundException(`Folder ${folderId} not found`);
    if (folder.ownerId !== ownerId) {
      throw new ForbiddenException('Only the owner can share this folder');
    }

    // Créer le partage
    return this.prisma.folderShare.create({
      data: {
        folder: { connect: { id: folderId } },
        user: { connect: { id: targetUserId } },
        canEdit
      }
    });
  }

  // Vérifier l'accès à un dossier
  private async checkFolderAccess(folderId: string, userId: string) {
    const folder = await this.prisma.folder.findUnique({
      where: { id: folderId },
      include: { sharedWith: true }
    });

    if (!folder) throw new NotFoundException(`Folder ${folderId} not found`);

    const hasAccess =
      folder.ownerId === userId ||
      folder.sharedWith.some(share => share.userId === userId);

    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this folder');
    }

    return folder;
  }

  // // Empêcher la création de cycles dans l'arborescence
  // private async checkFolderCycle(folderId: string, newParentId: string) {
  //   // Vérifier que le nouveau parent n'est pas un descendant du dossier courant
  //   let currentId = newParentId;
  //   let visited = new Set<string>();

  //   while (currentId) {
  //     if (currentId === folderId) {
  //       throw new ForbiddenException('Cannot create a cycle in folder hierarchy');
  //     }

  //     if (visited.has(currentId)) {
  //       break; // Éviter une boucle infinie si l'arborescence est déjà cassée
  //     }

  //     visited.add(currentId);

  //     const current = await this.prisma.folder.findUnique({
  //       where: { id: currentId },
  //       select: { parentId: true }
  //     });

  //     if (!current) break;
  //     currentId = current.parentId || null;
  //   }
  // }
}