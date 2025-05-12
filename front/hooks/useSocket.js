import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const useSocket = (url) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socketServerUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL;
    const newSocket = io(socketServerUrl);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
    });

    newSocket.on('message', (data) => {
      console.log('Message received:', data);
    });

    return () => newSocket.close();
  }, [url]);

  return socket;
};

export default useSocket;
