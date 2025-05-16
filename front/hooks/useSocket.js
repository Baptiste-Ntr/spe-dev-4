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

    newSocket.on('folderCreated', (folderData) => {
      console.log(`Folder created: ${folderData.name}`);
    });

    // Écouter l'événement de création de fichier
    newSocket.on('fileCreated', (fileData) => {
        console.log(`File created: ${fileData.title}`);
    });

    newSocket.on('renameFile', (fileData) => {
      console.log(`File renamed: ${fileData.title}`);
    });

    newSocket.on('deleteFile', (fileData) => {
      console.log(`File deleted: ID ${fileData.id}`);
    });

    newSocket.on('uploadFile', (fileData) => {
      console.log(`File uploaded: ${fileData.title}`);
    });

    newSocket.on('renameFolder', (folderData) => {
      console.log(`Folder renamed: ${folderData.name}`);
    });

    newSocket.on('deleteFolder', (folderData) => {
      console.log(`Folder deleted: ID ${folderData.id}`);
    });

    return () => {
      newSocket.off('connect');
      newSocket.off('disconnect');
      newSocket.off('user connected');
      newSocket.off('user disconnected');
      newSocket.off('folderCreated');
      newSocket.off('fileCreated');
      newSocket.off('renameFile');
      newSocket.off('deleteFile');
      newSocket.off('uploadFile');
      newSocket.off('renameFolder');
      newSocket.off('deleteFolder');
      newSocket.disconnect();
    };
  }, []);

  const createFolder = (folderName) => {
    if (socket) {
      socket.emit('folderCreated', { name: folderName });
    }
  };
  return { socket, createFolder };
};

export default useSocket;
