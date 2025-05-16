import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
    cors: {
        origin: 'http://localhost:3000',
        credentials: true,
    },
})
export class CallGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    private logger = new Logger('CallGateway');
    private userSockets = new Map<string, Socket>();
    private userNames = new Map<string, string>();
    private activeCalls = new Map<string, string>();

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
        // Trouver l'ID de l'utilisateur associé à ce socket
        for (const [userId, socket] of this.userSockets.entries()) {
            if (socket.id === client.id) {
                this.userSockets.delete(userId);
                this.userNames.delete(userId);

                // Vérifier si l'utilisateur était dans un appel
                for (const [callerId, targetId] of this.activeCalls.entries()) {
                    if (callerId === userId || targetId === userId) {
                        // Si l'utilisateur était dans un appel, le terminer
                        this.endCallForUsers(callerId, targetId);
                    }
                }
                // Émettre un événement pour informer les autres utilisateurs
                this.server.emit('user-left', userId);
                break;
            }
        }
    }

    // Enregistrement de l'utilisateur 
    @SubscribeMessage('register')
    handleRegister(client: Socket, data: { userId: string; userName: string }) {
        this.logger.log(`Registering user: ${data.userId} (${data.userName})`);
        this.userSockets.set(data.userId, client);
        this.userNames.set(data.userId, data.userName);
    }

    // Gestion de l'appel
    @SubscribeMessage('call-user')
    handleCallUser(client: Socket, targetUserId: string) {
        this.logger.log(`Call request from ${client.id} to ${targetUserId}`);
        const targetSocket = this.userSockets.get(targetUserId);
        const callerId = Array.from(this.userSockets.entries())
            .find(([_, socket]) => socket.id === client.id)?.[0];
        const callerName = callerId ? this.userNames.get(callerId) : 'Un utilisateur';

        if (targetSocket && callerId) {
            this.logger.log(`Sending incoming call to ${targetUserId}`);
            this.activeCalls.set(callerId, targetUserId);
            targetSocket.emit('incoming-call', {
                from: callerId,
                fromName: callerName
            });
        } else {
            this.logger.log(`Target user ${targetUserId} not found`);
        }
    }

    // Gestion de l'acceptation de l'appel
    @SubscribeMessage('answer-call')
    handleAnswerCall(client: Socket, targetUserId: string) {
        this.logger.log(`Answer call from ${client.id} to ${targetUserId}`);
        const targetSocket = this.userSockets.get(targetUserId);
        if (targetSocket) {
            targetSocket.emit('call-answered');
        }
    }

    // Fin de l'appel
    @SubscribeMessage('end-call')
    handleEndCall(client: Socket) {
        const userId = Array.from(this.userSockets.entries())
            .find(([_, socket]) => socket.id === client.id)?.[0];

        if (userId) {
            this.logger.log(`Ending call for user ${userId}`);
            // Trouver l'autre participant de l'appel
            for (const [callerId, targetId] of this.activeCalls.entries()) {
                if (callerId === userId || targetId === userId) {
                    this.endCallForUsers(callerId, targetId);
                    break;
                }
            }
        }
    }

    private endCallForUsers(callerId: string, targetId: string) {
        const callerSocket = this.userSockets.get(callerId);
        const targetSocket = this.userSockets.get(targetId);

        if (callerSocket) {
            callerSocket.emit('call-ended');
        }
        if (targetSocket) {
            targetSocket.emit('call-ended');
        }

        this.activeCalls.delete(callerId);
        this.logger.log(`Call ended between ${callerId} and ${targetId}`);
    }

    // Gestion des signaux WebRTC
    @SubscribeMessage('signal')
    handleSignal(client: Socket, data: { target: string; signal: any }) {
        this.logger.log(`Signal from ${client.id} to ${data.target}`);
        const targetSocket = this.userSockets.get(data.target);
        if (targetSocket) {
            this.logger.log(`Forwarding signal to ${data.target}`);
            targetSocket.emit('signal', data.signal);
        } else {
            this.logger.warn(`Target socket not found for user ${data.target}`);
        }
    }
} 