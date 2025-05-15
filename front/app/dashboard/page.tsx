'use client'

import { useEffect } from 'react';
import useSocket from '../../hooks/useSocket';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
    const socket = useSocket();
    const router = useRouter();

    useEffect(() => {

    if (!socket || typeof socket.on !== 'function') {
        console.warn('socket non prêt ou invalide dans Dashboard:', socket);
        return;
    }

    const handleConnect = () => {
        toast.success(`Vous êtes maintenant connecté au serveur !`);
    };

    socket.on('connect', handleConnect);

    return () => {
        socket.off('connect', handleConnect);
    };
    }, [socket]);
 

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Tableau de bord</h1>
            <ToastContainer />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Carte d'accès aux documents */}
                <div 
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => router.push('/documents')}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">Mes Documents</h2>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <p className="text-gray-600">Accéder à l'explorateur de documents pour gérer vos fichiers et dossiers.</p>
                    <div className="mt-4 flex justify-end">
                        <Link href="/documents" className="text-blue-500 hover:text-blue-700 font-medium">
                            Explorer →
                        </Link>
                    </div>
                </div>
            </div>
            
        </div>
    )
}
