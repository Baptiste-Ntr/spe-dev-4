// src/documents/documents.service.ts
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-documents.dto';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { DocumentType } from '@prisma/client';

@Injectable()
export class DocumentsService {
    constructor(private prisma: PrismaService, private readonly config: ConfigService,) { }

    private readonly logger = new Logger(DocumentsService.name);
    async create(dto: CreateDocumentDto, userId: string) {
        const folderId = dto.folderId ?? this.config.get<string>('ROOT_FOLDER_ID') ?? 'default-folder';

        const doc = await this.prisma.document.create({
            data: {
                title: dto.title,
                content: '',
                createdAt: new Date(),
                type: dto.type,
                folder: {
                    connect: {
                        id: folderId,
                    },
                },
                updatedBy: {
                    connect: {
                        id: userId,
                    },
                },
            },
            include: {
                folder: true,
            },
        });

        // Donne les droits d'édition à l'auteur
        await this.prisma.permission.create({
            data: {
                userId,
                documentId: doc.id,
                canEdit: true,
            },
        });

        return doc;
    }

    async findAll() {
        return this.prisma.document.findMany({
            include: {
                folder: { select: { id: true, name: true } },
            },
            orderBy: { title: 'asc' },
        });
    }

    async rename(id: string, newTitle: string) {
        return this.prisma.document.update({
            where: { id },
            data: { title: newTitle, updatedAt: new Date() },
        });
    }

    async remove(id: string) {
        try {
            // Récupérer le document pour vérifier son type et son chemin de fichier
            const document = await this.prisma.document.findUnique({
                where: { id },
            });

            if (!document) {
                throw new NotFoundException(`Document with ID ${id} not found`);
            }

            // Supprimer le fichier physique si ce n'est pas un document TEXT et qu'il a un chemin de fichier
            if (document.type !== DocumentType.TEXT && document.filePath) {
                try {
                    const filePath = path.join(process.cwd(), 'uploads', 'files', document.filePath);
                    this.logger.debug(`Tentative de suppression du fichier: ${filePath}`);

                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                        this.logger.debug(`Fichier supprimé avec succès: ${filePath}`);
                    } else {
                        this.logger.warn(`Fichier non trouvé lors de la suppression: ${filePath}`);
                    }
                } catch (fileError) {
                    this.logger.error(`Erreur lors de la suppression du fichier: ${fileError.message}`);
                    // On continue même si la suppression du fichier échoue
                }
            }

            // Supprimer le document de la base de données
            return this.prisma.document.delete({
                where: { id },
            });
        } catch (error) {
            this.logger.error(`Erreur lors de la suppression du document ${id}: ${error.message}`);
            throw error;
        }
    }
}
