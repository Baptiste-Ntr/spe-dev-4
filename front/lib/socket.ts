import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

class SocketService {
    private socket: Socket | null = null;
    private documentId: string | null = null;
    private onContentUpdate: ((content: string) => void) | null = null;

    connect() {
        if (!this.socket) {
            this.socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000', {
                withCredentials: true,
                autoConnect: true
            });

            this.socket.on('connect', () => {
                console.log('Connecté au serveur WebSocket');
            });

            this.socket.on('disconnect', () => {
                console.log('Déconnecté du serveur WebSocket');
                toast.error('Déconnecté du serveur de collaboration');
            });

            this.socket.on('error', (error) => {
                console.error('Erreur WebSocket:', error);
                toast.error(error.message || 'Erreur de connexion au serveur de collaboration');
            });

            this.socket.on('documentUpdated', ({ content }) => {
                if (this.onContentUpdate) {
                    this.onContentUpdate(content);
                }
            });
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.onContentUpdate = null;
        }
    }

    joinDocument(documentId: string, onContentUpdate: (content: string) => void) {
        if (!this.socket?.connected) {
            this.connect();
        }
        this.documentId = documentId;
        this.onContentUpdate = onContentUpdate;
        this.socket?.emit('joinDocument', { documentId });
    }

    leaveDocument(documentId: string) {
        if (this.socket) {
            this.socket.emit('leaveDocument', { documentId });
            this.documentId = null;
            this.onContentUpdate = null;
        }
    }

    updateDocument(documentId: string, content: string) {
        this.socket?.emit('updateDocument', { documentId, content });
    }
}

export const socketService = new SocketService(); 