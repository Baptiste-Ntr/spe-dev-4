import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';

interface DocumentRoom {
    documentId: string;
    users: Map<string, {
        socket: Socket;
        cursor?: { line: number; column: number };
    }>;
}

@Injectable()
@WebSocketGateway({
    cors: {
        origin: process.env.FRONT_URL || 'http://localhost:3000',
        credentials: true,
    },
})
export class CollaborationGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer() server: Server;
    private readonly logger = new Logger(CollaborationGateway.name);
    private documentRooms: Map<string, DocumentRoom> = new Map();

    afterInit(server: Server) {
        this.logger.log('✅ CollaborationGateway initialized');
    }

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
        // Nettoyer les rooms quand un client se déconnecte
        this.documentRooms.forEach((room, documentId) => {
            if (room.users.has(client.id)) {
                room.users.delete(client.id);
                if (room.users.size === 0) {
                    this.documentRooms.delete(documentId);
                } else {
                    this.server.to(documentId).emit('userLeft', { userId: client.id });
                }
            }
        });
    }

    @SubscribeMessage('joinDocument')
    handleJoinDocument(client: Socket, payload: { documentId: string }) {
        const { documentId } = payload;

        // Créer une nouvelle room si elle n'existe pas
        if (!this.documentRooms.has(documentId)) {
            this.documentRooms.set(documentId, {
                documentId,
                users: new Map(),
            });
        }

        const room = this.documentRooms.get(documentId);
        room?.users.set(client.id, { socket: client });

        client.join(documentId);
        this.logger.log(`Client ${client.id} joined document ${documentId}`);

        // Informer les autres utilisateurs
        this.server.to(documentId).emit('userJoined', {
            userId: client.id,
            usersCount: room?.users.size,
        });
    }

    @SubscribeMessage('leaveDocument')
    handleLeaveDocument(client: Socket, payload: { documentId: string }) {
        const { documentId } = payload;
        const room = this.documentRooms.get(documentId);

        if (room) {
            room.users.delete(client.id);
            client.leave(documentId);

            if (room.users.size === 0) {
                this.documentRooms.delete(documentId);
            } else {
                this.server.to(documentId).emit('userLeft', { userId: client.id });
            }
        }
    }

    @SubscribeMessage('updateDocument')
    handleDocumentUpdate(client: Socket, payload: {
        documentId: string;
        changes: any;
        version: number;
    }) {
        const { documentId, changes, version } = payload;
        const room = this.documentRooms.get(documentId);

        if (room) {
            // Diffuser les changements à tous les utilisateurs dans la room
            client.to(documentId).emit('documentUpdated', {
                userId: client.id,
                changes,
                version,
            });
        }
    }

    @SubscribeMessage('updateCursor')
    handleCursorUpdate(client: Socket, payload: {
        documentId: string;
        cursor: { line: number; column: number };
    }) {
        const { documentId, cursor } = payload;
        const room = this.documentRooms.get(documentId);
        if (room && room.users.has(client.id)) {
            const user = room.users.get(client.id);
            if (user) {
                user.cursor = cursor;
                client.to(documentId).emit('cursorUpdated', {
                    userId: client.id,
                    cursor,
                });
            }
        }
    }
} 