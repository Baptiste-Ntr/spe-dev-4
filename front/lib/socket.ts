import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

class SocketService {
    private socket: Socket | null = null;
    private documentId: string | null = null;
    private onContentUpdate: ((content: string) => void) | null = null;
    private onCollaboratorsUpdate: ((users: string[]) => void) | null = null;
    private userId: string | null = null;

    connect() {
        if (!this.socket) {
            this.socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000', {
                withCredentials: true,
                autoConnect: true
            });

            this.socket.on('connect', () => {
                console.log('Connecté au serveur WebSocket');
                if (this.documentId && this.userId) {
                    this.socket?.emit('joinDocument', { documentId: this.documentId, userId: this.userId });
                }
            });

            this.socket.on('disconnect', () => {
                console.log('Déconnecté du serveur WebSocket');
                toast.error('Déconnecté du serveur de collaboration');
            });

            this.socket.on('error', (error) => {
                console.error('Erreur WebSocket:', error);
                toast.error(error.message || 'Erreur de connexion au serveur de collaboration');
            });

            this.socket.on('documentUpdated', ({ content, userId }) => {
                if (this.onContentUpdate && userId !== this.userId) {
                    this.onContentUpdate(content);
                }
            });

            this.socket.on('activeCollaborators', ({ users }) => {
                if (this.onCollaboratorsUpdate) {
                    this.onCollaboratorsUpdate(users);
                }
            });
        }
    }

    disconnect() {
        if (this.socket) {
            if (this.documentId && this.userId) {
                this.socket.emit('leaveDocument', { documentId: this.documentId, userId: this.userId });
            }
            this.socket.disconnect();
            this.socket = null;
            this.onContentUpdate = null;
            this.onCollaboratorsUpdate = null;
            this.userId = null;
            this.documentId = null;
        }
    }

    joinDocument(
        documentId: string,
        userId: string,
        onContentUpdate: (content: string) => void,
        onCollaboratorsUpdate: (users: string[]) => void
    ) {
        if (!this.socket?.connected) {
            this.connect();
        }
        this.documentId = documentId;
        this.userId = userId;
        this.onContentUpdate = onContentUpdate;
        this.onCollaboratorsUpdate = onCollaboratorsUpdate;
        this.socket?.emit('joinDocument', { documentId, userId });
    }

    leaveDocument(documentId: string, userId: string) {
        if (this.socket) {
            this.socket.emit('leaveDocument', { documentId, userId });
            this.documentId = null;
            this.userId = null;
            this.onContentUpdate = null;
            this.onCollaboratorsUpdate = null;
        }
    }

    updateDocument(documentId: string, content: string) {
        if (this.socket && this.userId) {
            this.socket.emit('updateDocument', { documentId, content, userId: this.userId });
        }
    }
}

export const socketService = new SocketService(); 