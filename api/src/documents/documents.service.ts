import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-documents.dto';
import { ConfigService } from '@nestjs/config';
import { UpdateDocumentDto } from './dto/update-document.dto';
import * as fs from 'fs';
import * as path from 'path';
import { DocumentType } from '@prisma/client';

@Injectable()
export class DocumentsService {
    constructor(private prisma: PrismaService, private readonly config: ConfigService,) { }

    private readonly logger = new Logger(DocumentsService.name);

    // Récupération de tous les documents partagés avec l'utilisateur
    async findSharedDocuments(userId: string) {
        return this.prisma.document.findMany({
            where: {
                Collaborator: {
                    some: {
                        userId: userId,
                        active: true
                    }
                }
            },
            include: {
                folder: { select: { id: true, name: true } },
                updatedBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });
    }

    // Création d'un document texte
    async create(dto: CreateDocumentDto, userId: string) {
        const folderId = dto.folderId;

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

    // Récupération de tous les documents
    async findAll() {
        return this.prisma.document.findMany({
            include: {
                folder: { select: { id: true, name: true } },
            },
            orderBy: { title: 'asc' },
        });
    }

    // Récupération d'un document par son ID
    async findById(id: string) {
        const document = await this.prisma.document.findUnique({
            where: { id },
            include: {
                folder: { select: { id: true, name: true } },
            },
        });
        if (!document) {
            throw new NotFoundException('Document non trouvé');
        }
        return document;
    }

    // Renommer un document
    async rename(id: string, newTitle: string) {
        return this.prisma.document.update({
            where: { id },
            data: { title: newTitle, updatedAt: new Date() },
        });
    }

    // Mise à jour d'un document
    async update(id: string, dto: UpdateDocumentDto) {
        return this.prisma.document.update({
            where: { id },
            data: {
                title: dto.title,
                content: dto.content,
                folderId: dto.folderId,
                updatedAt: dto.updatedAt,
                updatedById: dto.updatedById,
            },
        });
    }

    // Suppression d'un document
    async remove(id: string) {
        try {
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

    // Récupération des collaborateurs d'un document
    async getDocumentCollaborators(documentId: string) {
        const document = await this.prisma.document.findUnique({
            where: { id: documentId },
            include: {
                updatedBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                createdBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });

        if (!document) {
            throw new NotFoundException('Document non trouvé');
        }

        const [allCollaborators, pendingInvitations] = await Promise.all([
            // Récupérer tous les collaborateurs avec leur état actif
            this.prisma.collaborator.findMany({
                where: {
                    documentId
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true
                        }
                    }
                }
            }),
            // Récupérer les invitations en attente
            this.prisma.invitation.findMany({
                where: {
                    documentId,
                    status: 'PENDING'
                },
                include: {
                    invitedTo: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true
                        }
                    }
                }
            })
        ]);

        // Créer la liste des collaborateurs avec leur état actif
        const allUsers = allCollaborators.map(c => ({
            ...c.user,
            active: c.active
        }));

        // Ajouter le créateur à la liste des collaborateurs s'il n'est pas déjà inclus
        if (document.createdBy?.id && !allUsers.some(c => c.id === document.createdBy?.id)) {
            allUsers.push({
                ...document.createdBy,
                active: true // Le créateur est toujours considéré comme actif
            });
        }

        // Ajouter l'inviteur à la liste des collaborateurs s'il n'y est pas déjà
        if (document.updatedBy?.id && !allUsers.some(c => c.id === document.updatedBy?.id)) {
            allUsers.push({
                ...document.updatedBy,
                active: true // L'inviteur est toujours considéré comme actif
            });
        }

        return {
            activeCollaborators: allUsers,
            pendingInvitations: pendingInvitations.map(inv => ({
                id: inv.id,
                invitedTo: inv.invitedTo,
                createdAt: inv.createdAt
            }))
        };
    }
}
