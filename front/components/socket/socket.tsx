import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

const Home = () => {
  const [status, setStatus] = useState('Disconnected');

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server');
      setStatus('Connected');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setStatus('Disconnected');
    });

    socket.on('user connected', (message) => {
      console.log(message);
    });

    socket.on('user disconnected', (message) => {
      console.log(message);
    });

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
