// src/documents/documents.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-documents.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DocumentsService {
    constructor(private prisma: PrismaService, private readonly config: ConfigService,) { }

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
                updatedBy:  {
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
                folder: { select: { id: true, name: true} },
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
        return this.prisma.document.delete({
            where: { id },
        });
    }
}
