import { Injectable } from '@nestjs/common';
import { InvitationStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

interface Invitation {
    id: string;
    documentId: string;
    invitedById: string;
    invitedToId: string;
    status: InvitationStatus;
    token: string;
    expiresAt: Date;
    createdAt: Date;
    document?: {
        title: string;
    };
}

@Injectable()
export class InvitationService {
    constructor(
        private prisma: PrismaService,
        private notificationsService: NotificationsService,
    ) { }

    async createInvitation(
        documentId: string,
        invitedById: string,
        invitedToId: string,
    ) {
        const token = this.generateToken();
        const invitation = await this.prisma.invitation.create({
            data: {
                document: { connect: { id: documentId } },
                invitedBy: { connect: { id: invitedById } },
                invitedTo: { connect: { id: invitedToId } },
                token,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
            },
            include: {
                document: true,
                invitedBy: true,
                invitedTo: true,
            },
        });

        // Créer une notification pour l'invitation
        await this.notificationsService.createNotification({
            type: 'INVITATION',
            title: 'Nouvelle invitation',
            message: `${invitation.invitedBy.firstName} ${invitation.invitedBy.lastName} vous a invité à collaborer sur le document "${invitation.document.title}"`,
            userId: invitedToId,
            senderId: invitedById,
            documentId: documentId,
            token: token,
        });

        return invitation;
    }

    private generateToken(): string {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    async getInvitation(token: string): Promise<Invitation | null> {
        return this.prisma.invitation.findUnique({
            where: { token },
            include: {
                document: {
                    select: {
                        title: true
                    }
                }
            }
        })
    }

    async acceptInvitation(token: string): Promise<Invitation> {
        const invitation = await this.prisma.invitation.update({
            where: { token },
            data: { status: InvitationStatus.ACCEPTED },
            include: {
                document: {
                    select: {
                        title: true
                    }
                }
            }
        })
        if (!invitation) {
            throw new Error('Invitation non trouvée ou déjà acceptée');
        }

        // Ajouter l'utilisateur à la liste des collaborateurs du document
        await this.prisma.collaborator.create({
            data: {
                documentId: invitation.documentId,
                userId: invitation.invitedToId,
                active: true
            }
        });

        const invitedTo = await this.prisma.user.findUnique({
            where: { id: invitation.invitedToId },
        });

        // Supprimer la notification d'invitation pour l'invité
        await this.prisma.notification.deleteMany({
            where: {
                token: token,
                userId: invitation.invitedToId
            }
        });

        // Créer une notification pour l'invité confirmant l'acceptation
        await this.notificationsService.createNotification({
            type: 'COLLABORATOR_JOIN',
            title: 'Invitation acceptée',
            message: `Vous avez accepté l'invitation pour le document "${invitation.document?.title}"`,
            userId: invitation.invitedToId,
            senderId: invitation.invitedToId,
            documentId: invitation.documentId
        });

        // Créer une notification pour l'inviteur
        await this.notificationsService.createNotification({
            type: 'COLLABORATOR_JOIN',
            title: 'Invitation acceptée',
            message: `${invitedTo?.firstName} ${invitedTo?.lastName} a accepté votre invitation pour le document "${invitation.document?.title}"`,
            userId: invitation.invitedById,
            senderId: invitation.invitedToId,
            documentId: invitation.documentId
        });

        return invitation
    }

    async declineInvitation(token: string): Promise<Invitation> {
        const invitation = await this.prisma.invitation.update({
            where: { token },
            data: { status: InvitationStatus.DECLINED },
            include: {
                document: {
                    select: {
                        title: true
                    }
                }
            }
        })
        if (!invitation) {
            throw new Error('Invitation non trouvée ou déjà refusée');
        }

        // Supprimer la notification d'invitation pour l'invité
        await this.prisma.notification.deleteMany({
            where: {
                token: token,
                userId: invitation.invitedToId
            }
        });

        // Créer une notification pour l'invité confirmant le refus
        await this.notificationsService.createNotification({
            type: 'COLLABORATOR_LEAVE',
            title: 'Invitation refusée',
            message: `Vous avez refusé l'invitation pour le document "${invitation.document?.title}"`,
            userId: invitation.invitedToId,
            senderId: invitation.invitedToId,
            documentId: invitation.documentId
        });

        // Créer une notification pour l'inviteur
        const invitedTo = await this.prisma.user.findUnique({
            where: { id: invitation.invitedToId },
        });

        await this.notificationsService.createNotification({
            type: 'COLLABORATOR_LEAVE',
            title: 'Invitation refusée',
            message: `${invitedTo?.firstName} ${invitedTo?.lastName} a refusé votre invitation pour le document "${invitation.document?.title}"`,
            userId: invitation.invitedById,
            senderId: invitation.invitedToId,
            documentId: invitation.documentId
        });

        return invitation
    }

    async getInvitationStatus(token: string): Promise<InvitationStatus> {
        const invitation = await this.prisma.invitation.findUnique({
            where: { token },
        })
        return invitation?.status || InvitationStatus.PENDING;
    }

    async getInvitationsByUser(userId: string): Promise<Invitation[]> {
        return this.prisma.invitation.findMany({
            where: { invitedToId: userId },
            include: {
                document: {
                    select: {
                        title: true
                    }
                }
            }
        })
    }
}
