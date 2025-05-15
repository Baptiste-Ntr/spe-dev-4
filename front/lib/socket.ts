import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

export interface CursorPosition {
    line: number;
    column: number;
}

export interface Collaborator {
    userId: string;
    cursor?: CursorPosition;
    color: string;
}

class SocketService {
    private socket: Socket | null = null;
    private collaborators: Map<string, Collaborator> = new Map();
    private colors = [
        '#FF6B6B', // Rouge
        '#4ECDC4', // Turquoise
        '#45B7D1', // Bleu clair
        '#96CEB4', // Vert menthe
        '#FFEEAD', // Jaune pâle
        '#D4A5A5', // Rose poudré
        '#9B59B6', // Violet
        '#3498DB', // Bleu
    ];

    connect() {
        if (this.socket?.connected) return;

        this.socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', {
            withCredentials: true,
        });

        this.socket.on('connect', () => {
            console.log('Connected to WebSocket');
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from WebSocket');
            toast.error('Déconnecté du serveur de collaboration');
        });

        this.socket.on('userJoined', ({ userId, usersCount }) => {
            const color = this.colors[this.collaborators.size % this.colors.length];
            this.collaborators.set(userId, { userId, color });
            toast.info(`${usersCount} utilisateur(s) connecté(s)`);
        });

        this.socket.on('userLeft', ({ userId }) => {
            this.collaborators.delete(userId);
            toast.info('Un utilisateur a quitté le document');
        });

        this.socket.on('cursorUpdated', ({ userId, cursor }) => {
            const collaborator = this.collaborators.get(userId);
            if (collaborator) {
                this.collaborators.set(userId, { ...collaborator, cursor });
            }
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    joinDocument(documentId: string) {
        if (!this.socket?.connected) {
            this.connect();
        }
        this.socket?.emit('joinDocument', { documentId });
    }

    leaveDocument(documentId: string) {
        this.socket?.emit('leaveDocument', { documentId });
    }

    updateCursor(documentId: string, cursor: CursorPosition) {
        this.socket?.emit('updateCursor', { documentId, cursor });
    }

    updateDocument(documentId: string, changes: any, version: number) {
        this.socket?.emit('updateDocument', { documentId, changes, version });
    }

    getCollaborators(): Collaborator[] {
        return Array.from(this.collaborators.values());
    }
}

export const socketService = new SocketService(); 