import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    ConnectedSocket,
    MessageBody
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface ActiveUser {
    id: string;
    socketId: string;
}

@WebSocketGateway({
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true
    }
})
export class CollaborationGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(CollaborationGateway.name);
    private documentRooms: Map<string, Map<string, string>> = new Map(); // documentId -> Map<socketId, userId>

    constructor(private prisma: PrismaService) { }

    handleConnection(client: Socket) {
        this.logger.log(`Client connecté: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client déconnecté: ${client.id}`);

        // Nettoyer les salles de document
        this.documentRooms.forEach((users, documentId) => {
            if (users.has(client.id)) {
                const userId = users.get(client.id);
                users.delete(client.id);

                if (users.size === 0) {
                    this.documentRooms.delete(documentId);
                } else {
                    // Envoyer la liste mise à jour des collaborateurs actifs
                    const activeUsers = Array.from(users.values());
                    this.server.to(documentId).emit('activeCollaborators', { users: activeUsers });
                }

                this.logger.log(`Utilisateur ${userId} déconnecté du document ${documentId}`);
            }
        });
    }

    @SubscribeMessage('joinDocument')
    handleJoinDocument(client: Socket, payload: { documentId: string, userId: string }) {
        const { documentId, userId } = payload;

        // Rejoindre la salle du document
        client.join(documentId);

        // Ajouter l'utilisateur à la liste des collaborateurs actifs
        if (!this.documentRooms.has(documentId)) {
            this.documentRooms.set(documentId, new Map());
        }
        this.documentRooms.get(documentId)?.set(client.id, userId);

        // Envoyer la liste des collaborateurs actifs à tous les clients dans la salle
        const activeUsers = Array.from(this.documentRooms.get(documentId)?.values() || []);
        this.server.to(documentId).emit('activeCollaborators', { users: activeUsers });

        this.logger.log(`Utilisateur ${userId} a rejoint le document ${documentId}`);
    }

    @SubscribeMessage('leaveDocument')
    handleLeaveDocument(client: Socket, payload: { documentId: string, userId: string }) {
        const { documentId, userId } = payload;

        // Quitter la salle du document
        client.leave(documentId);

        // Retirer l'utilisateur de la liste des collaborateurs actifs
        const users = this.documentRooms.get(documentId);
        if (users) {
            users.delete(client.id);
            if (users.size === 0) {
                this.documentRooms.delete(documentId);
            } else {
                // Envoyer la liste mise à jour des collaborateurs actifs
                const activeUsers = Array.from(users.values());
                this.server.to(documentId).emit('activeCollaborators', { users: activeUsers });
            }
        }

        this.logger.log(`Utilisateur ${userId} a quitté le document ${documentId}`);
    }

    @SubscribeMessage('updateDocument')
    handleUpdateDocument(client: Socket, payload: { documentId: string, content: string, userId: string }) {
        const { documentId, content, userId } = payload;

        // Diffuser la mise à jour à tous les clients dans la salle, sauf l'expéditeur
        client.to(documentId).emit('documentUpdated', { content, userId });

        this.logger.log(`Document ${documentId} mis à jour par l'utilisateur ${userId}`);
    }
} 