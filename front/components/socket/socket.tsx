import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3000'); // Assurez-vous que l'URL est correcte

const Home = () => {
  const [status, setStatus] = useState('Disconnected');

  useEffect(() => {
    // Écouter l'événement de connexion
    socket.on('connect', () => {
      console.log('Connected to server');
      setStatus('Connected');
    });

    // Écouter l'événement de déconnexion
    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setStatus('Disconnected');
    });

    // Écouter les événements personnalisés
    socket.on('user connected', (message) => {
      console.log(message);
      // Mettre à jour l'interface utilisateur pour afficher le message
    });

    socket.on('user disconnected', (message) => {
      console.log(message);
      // Mettre à jour l'interface utilisateur pour afficher le message
    });

    // Nettoyer les écouteurs d'événements lors du démontage du composant
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('user connected');
      socket.off('user disconnected');
    };
  }, []);

  return (
    <div>
      <h1>Socket.IO Example</h1>
      <p>Status: {status}</p>
    </div>
  );
};

export default Home;
