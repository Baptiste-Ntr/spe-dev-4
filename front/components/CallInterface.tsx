import React, { useEffect, useRef } from 'react';
import { useCallStore } from '../services/callService';
import { Button } from './ui/button';
import { Phone, PhoneOff } from 'lucide-react';

interface CallInterfaceProps {
    targetUserId: string;
    onCallEnd?: () => void;
}

export const CallInterface: React.FC<CallInterfaceProps> = ({
    targetUserId,
    onCallEnd,
}) => {
    const { localStream, remoteStream, isCallActive } = useCallStore();
    const localAudioRef = useRef<HTMLAudioElement>(null);
    const remoteAudioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        if (localAudioRef.current && localStream) {
            localAudioRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        if (remoteAudioRef.current && remoteStream) {
            remoteAudioRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    const handleEndCall = () => {
        useCallStore.getState().endCall();
        onCallEnd?.();
    };

    return (
        <div className="flex flex-col items-center gap-4 p-4 bg-white rounded-lg shadow-lg">
            <div className="flex items-center gap-4">
                <audio ref={localAudioRef} autoPlay muted />
                <audio ref={remoteAudioRef} autoPlay />
            </div>

            <div className="flex gap-4">
                {isCallActive ? (
                    <Button
                        onClick={handleEndCall}
                        variant="destructive"
                        className="flex items-center gap-2"
                    >
                        <PhoneOff className="w-4 h-4" />
                        Terminer l&apos;appel
                    </Button>
                ) : (
                    <Button
                        onClick={() => useCallStore.getState().startCall(targetUserId)}
                        className="flex items-center gap-2"
                    >
                        <Phone className="w-4 h-4" />
                        Appeler
                    </Button>
                )}
            </div>
        </div>
    );
}; 