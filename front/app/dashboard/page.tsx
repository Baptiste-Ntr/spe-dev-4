'use client'

import { useEffect } from 'react';
import useSocket from '../../hooks/useSocket';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function DashboardPage() {
    const socket = useSocket();

    useEffect(() => {
        if (socket) {
            const handleConnect = () => {
                toast.success(`Vous êtes maintenant connecté au serveur !`);
            };

            socket.on('connect', handleConnect);

            // Nettoyer les écouteurs d'événements lors du démontage du composant
            return () => {
                socket.off('connect', handleConnect);
            };
        }
    }, [socket]);

    return (
        <div>
            <h1>Dashboard</h1>
            <p>Check the console for connection and disconnection logs.</p>
            <ToastContainer />
        </div>
    )
}
