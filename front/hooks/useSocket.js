// hooks/useSocket.js
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const useSocket = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io('http://localhost:8000', {
      withCredentials: true,
      transports: ['websocket'],
    });

    setSocket(newSocket);

    // Écouter l'événement de connexion
    newSocket.on('connect', () => {
      console.log('Connected to server', newSocket.id);
    });

    // Écouter l'événement de déconnexion
    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    // Écouter les événements personnalisés
    newSocket.on('user connected', (message) => {
      console.log(message);
    });

    newSocket.on('user disconnected', (message) => {
      console.log(message);
    });

    // Écouter l'événement de création de dossier
    newSocket.on('folderCreated', (folderData) => {
      console.log(`Folder created: ${folderData.name}`);
    });

    // // Écouter l'événement de création de fichier
    // newSocket.on('fileCreated', (fileData) => {
    //   console.log(`File created: ${fileData.name}`);
    // });

    // Nettoyer les écouteurs d'événements lors du démontage du composant
    return () => {
      newSocket.off('connect');
      newSocket.off('disconnect');
      newSocket.off('user connected');
      newSocket.off('user disconnected');
      newSocket.off('folderCreated');
      newSocket.off('fileCreated');
      newSocket.disconnect();
    };
  }, []);

  return socket;
};

export default useSocket; // Exportez le hook
