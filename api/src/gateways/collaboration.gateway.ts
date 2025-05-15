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
import { PrismaService } from '../prisma/prisma.service';

@WebSocketGateway({
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true
    }
})
export class CollaborationGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private documentRooms: Map<string, Set<string>> = new Map();

    constructor(private prisma: PrismaService) { }

    async handleConnection(client: Socket) {
        console.log(`Client connecté: ${client.id}`);
    }

    async handleDisconnect(client: Socket) {
        console.log(`Client déconnecté: ${client.id}`);
        // Nettoyer les rooms
        this.documentRooms.forEach((users, documentId) => {
            if (users.has(client.id)) {
                users.delete(client.id);
                if (users.size === 0) {
                    this.documentRooms.delete(documentId);
                }
            }
        });
    }

    @SubscribeMessage('joinDocument')
    async handleJoinDocument(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { documentId: string }
    ) {
        const { documentId } = data;
        client.join(documentId);

        if (!this.documentRooms.has(documentId)) {
            this.documentRooms.set(documentId, new Set());
        }
        this.documentRooms.get(documentId)?.add(client.id);
    }

    @SubscribeMessage('leaveDocument')
    async handleLeaveDocument(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { documentId: string }
    ) {
        const { documentId } = data;
        client.leave(documentId);

        const users = this.documentRooms.get(documentId);
        if (users) {
            users.delete(client.id);
            if (users.size === 0) {
                this.documentRooms.delete(documentId);
            }
        }
    }

    @SubscribeMessage('updateDocument')
    async handleUpdateDocument(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { documentId: string; content: string }
    ) {
        const { documentId, content } = data;
        // Diffuser le contenu mis à jour aux autres clients
        client.to(documentId).emit('documentUpdated', { content });
    }
} 