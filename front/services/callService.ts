import { io, Socket } from 'socket.io-client';
import SimplePeer from 'simple-peer';
import { create } from 'zustand';
import { toast } from 'sonner';

interface CallState {
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    peer: SimplePeer.Instance | null;
    isCallActive: boolean;
    incomingCall: { from: string; fromName: string } | null;
    setLocalStream: (stream: MediaStream | null) => void;
    setRemoteStream: (stream: MediaStream | null) => void;
    setPeer: (peer: SimplePeer.Instance | null) => void;
    setIsCallActive: (isActive: boolean) => void;
    setIncomingCall: (call: { from: string; fromName: string } | null) => void;
    startCall: (targetUserId: string) => Promise<void>;
    endCall: () => void;
    answerCall: (targetUserId: string) => Promise<void>;
    registerUser: (userId: string, userName: string) => void;
}

class CallService {
    private socket: Socket | undefined;
    private peer: SimplePeer.Instance | null = null;
    private ringtone: HTMLAudioElement | null = null;
    private currentUserId: string | null = null;
    private targetUserId: string | null = null;
    private isInitiator: boolean = false;
    private audioContext: AudioContext | null = null;
    private remoteAudioElement: HTMLAudioElement | null = null;

    constructor() {
        if (typeof window !== 'undefined') {
            console.log('Initializing CallService...');
            this.socket = io('http://localhost:8000', {
                withCredentials: true,
            });

            this.setupSocketListeners();
            this.initializeRingtone();
            this.initializeAudioContext();
            this.initializeRemoteAudio();
        }
    }

    private initializeRemoteAudio() {
        if (typeof window !== 'undefined') {
            this.remoteAudioElement = new Audio();
            this.remoteAudioElement.autoplay = true;
            this.remoteAudioElement.muted = false;
        }
    }

    private initializeAudioContext() {
        if (typeof window !== 'undefined') {
            try {
                this.audioContext = new AudioContext();
                console.log('AudioContext initialized');
            } catch (error) {
                console.error('Failed to initialize AudioContext:', error);
            }
        }
    }

    private initializeRingtone() {
        if (typeof window !== 'undefined') {
            try {
                this.ringtone = new Audio();
                this.ringtone.src = '/ringtone.mp3';
                this.ringtone.loop = true;
            } catch (error) {
                console.warn('Ringtone initialization failed:', error);
            }
        }
    }

    private setupSocketListeners() {
        if (!this.socket) return;

        this.socket.on('connect', () => {
            console.log('Socket connected');
            if (this.currentUserId) {
                this.registerUser(this.currentUserId, 'User');
            }
        });

        this.socket.on('disconnect', () => {
            console.log('Socket disconnected');
            this.endCall();
        });

        this.socket.on('signal', (data) => {
            console.log('Received signal:', data);
            if (this.peer) {
                try {
                    this.peer.signal(data);
                } catch (error) {
                    console.error('Error processing signal:', error);
                }
            }
        });

        this.socket.on('incoming-call', (data: { from: string; fromName: string }) => {
            console.log('Incoming call from:', data);
            this.targetUserId = data.from;
            this.isInitiator = false;
            useCallStore.getState().setIncomingCall(data);
            try {
                if (this.ringtone) {
                    this.ringtone.play().catch(error => {
                        console.warn('Failed to play ringtone:', error);
                    });
                }
            } catch (error) {
                console.warn('Failed to play ringtone:', error);
            }
            toast.info(`Appel entrant de ${data.fromName}`, {
                action: {
                    label: 'Répondre',
                    onClick: () => this.answerCall(data.from)
                },
                duration: 30000
            });
        });

        this.socket.on('call-answered', () => {
            console.log('Call answered');
            toast.success('Appel connecté');
        });

        this.socket.on('call-ended', () => {
            console.log('Call ended event received');
            this.endCall();
            toast.info('Appel terminé');
        });

        this.socket.on('user-left', (userId: string) => {
            console.log('User left event received:', userId);
            if (userId === this.targetUserId) {
                this.endCall();
                toast.info('L\'autre participant a quitté l\'appel');
            }
        });
    }

    registerUser(userId: string, userName: string) {
        console.log('Registering user:', { userId, userName });
        this.currentUserId = userId;
        this.socket?.emit('register', { userId, userName });
    }

    private async setupAudioStream(): Promise<MediaStream> {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                },
                video: false,
            });

            // Vérifier que le flux audio est actif
            const audioTrack = stream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = true;
                console.log('Audio track settings:', audioTrack.getSettings());
                console.log('Audio track enabled:', audioTrack.enabled);
                console.log('Audio track muted:', audioTrack.muted);
            }

            return stream;
        } catch (error) {
            console.error('Error getting audio stream:', error);
            throw error;
        }
    }

    async startCall(targetUserId: string) {
        if (typeof window === 'undefined') return;

        console.log('Starting call to:', targetUserId);
        this.targetUserId = targetUserId;
        this.isInitiator = true;
        try {
            const stream = await this.setupAudioStream();
            console.log('Got local media stream');

            useCallStore.getState().setLocalStream(stream);

            this.peer = new SimplePeer({
                initiator: true,
                trickle: false,
                stream,
                config: {
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:stun1.l.google.com:19302' }
                    ]
                }
            });

            this.setupPeerListeners();
            console.log('Emitting call-user event');
            this.socket?.emit('call-user', targetUserId);
        } catch (error) {
            console.error('Error starting call:', error);
            toast.error('Erreur lors du démarrage de l\'appel');
            throw error;
        }
    }

    async answerCall(targetUserId: string) {
        if (typeof window === 'undefined') return;

        console.log('Answering call from:', targetUserId);
        this.targetUserId = targetUserId;
        this.isInitiator = false;
        try {
            const stream = await this.setupAudioStream();
            console.log('Got local media stream for answer');

            useCallStore.getState().setLocalStream(stream);
            try {
                if (this.ringtone) {
                    this.ringtone.pause();
                }
            } catch (error) {
                console.warn('Failed to pause ringtone:', error);
            }

            this.peer = new SimplePeer({
                initiator: false,
                trickle: false,
                stream,
                config: {
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:stun1.l.google.com:19302' }
                    ]
                }
            });

            this.setupPeerListeners();
            console.log('Emitting answer-call event');
            this.socket?.emit('answer-call', targetUserId);
        } catch (error) {
            console.error('Error answering call:', error);
            toast.error('Erreur lors de la réponse à l\'appel');
            throw error;
        }
    }

    private setupPeerListeners() {
        if (!this.peer) return;

        this.peer.on('signal', (data) => {
            console.log('Peer signal:', data);
            if (!this.targetUserId) {
                console.warn('No target user ID available for signal');
                return;
            }
            console.log('Sending signal to:', this.targetUserId);
            this.socket?.emit('signal', {
                target: this.targetUserId,
                signal: data
            });
        });

        this.peer.on('connect', () => {
            console.log('Peer connection established');
            useCallStore.getState().setIsCallActive(true);
        });

        this.peer.on('stream', (stream) => {
            console.log('Received remote stream');
            // Vérifier le flux audio distant
            const audioTrack = stream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = true;
                console.log('Remote audio track settings:', audioTrack.getSettings());
                console.log('Remote audio track enabled:', audioTrack.enabled);
                console.log('Remote audio track muted:', audioTrack.muted);
            }

            // Configurer l'élément audio pour le flux distant
            if (this.remoteAudioElement) {
                this.remoteAudioElement.srcObject = stream;
                this.remoteAudioElement.muted = false;
                this.remoteAudioElement.play().catch(error => {
                    console.error('Error playing remote audio:', error);
                });
            }

            useCallStore.getState().setRemoteStream(stream);
        });

        this.peer.on('close', () => {
            console.log('Peer connection closed');
            this.endCall();
        });

        this.peer.on('error', (err) => {
            console.error('Peer error:', err);
            toast.error('Erreur de connexion audio');
            this.endCall();
        });
    }

    endCall() {
        console.log('Ending call');
        if (this.peer) {
            this.peer.destroy();
            this.peer = null;
        }

        const localStream = useCallStore.getState().localStream;
        if (localStream) {
            localStream.getTracks().forEach(track => {
                track.stop();
                console.log('Stopped track:', track.kind, track.label);
            });
        }

        if (this.remoteAudioElement) {
            this.remoteAudioElement.srcObject = null;
        }

        try {
            if (this.ringtone) {
                this.ringtone.pause();
            }
        } catch (error) {
            console.warn('Failed to pause ringtone:', error);
        }

        if (this.socket?.connected) {
            this.socket.emit('end-call');
        }

        this.targetUserId = null;
        this.isInitiator = false;

        useCallStore.getState().setLocalStream(null);
        useCallStore.getState().setRemoteStream(null);
        useCallStore.getState().setPeer(null);
        useCallStore.getState().setIsCallActive(false);
        useCallStore.getState().setIncomingCall(null);
    }
}

const callService = new CallService();

export const useCallStore = create<CallState>((set) => ({
    localStream: null,
    remoteStream: null,
    peer: null,
    isCallActive: false,
    incomingCall: null,
    setLocalStream: (stream) => set({ localStream: stream }),
    setRemoteStream: (stream) => set({ remoteStream: stream }),
    setPeer: (peer) => set({ peer }),
    setIsCallActive: (isActive) => set({ isCallActive: isActive }),
    setIncomingCall: (call) => set({ incomingCall: call }),
    startCall: (targetUserId) => callService.startCall(targetUserId),
    endCall: () => callService.endCall(),
    answerCall: (targetUserId) => callService.answerCall(targetUserId),
    registerUser: (userId, userName) => callService.registerUser(userId, userName),
})); 