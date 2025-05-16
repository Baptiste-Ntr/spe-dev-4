'use client'

import { useEffect, useState } from 'react';
import { socketService, Collaborator } from '@/lib/socket';

export const CollaboratorCursors = () => {
    const [collaborators, setCollaborators] = useState<Collaborator[]>([]);

    useEffect(() => {
        const updateCollaborators = () => {
            setCollaborators(socketService.getCollaborators());
        };

        // Mettre à jour les collaborateurs toutes les 100ms
        const interval = setInterval(updateCollaborators, 100);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            {collaborators.map((collaborator) => {
                if (!collaborator.cursor) return null;

                return (
                    <div
                        key={collaborator.userId}
                        className="absolute"
                        style={{
                            left: `${collaborator.cursor.column * 8}px`, // Approximation de la largeur d'un caractère
                            top: `${collaborator.cursor.line * 20}px`, // Approximation de la hauteur d'une ligne
                        }}
                    >
                        <div
                            className="w-2 h-5"
                            style={{
                                backgroundColor: collaborator.color,
                                transform: 'translateY(-50%)',
                            }}
                        />
                        <div
                            className="absolute top-0 left-0 px-2 py-1 text-xs text-white rounded"
                            style={{
                                backgroundColor: collaborator.color,
                                transform: 'translateY(-100%)',
                            }}
                        >
                            {collaborator.userId}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}; 