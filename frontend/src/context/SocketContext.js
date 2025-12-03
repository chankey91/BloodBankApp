import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

// Determine socket URL based on environment
const getSocketUrl = () => {
  // In production, connect to the same origin (Nginx proxies /socket.io to backend)
  if (process.env.NODE_ENV === 'production') {
    return window.location.origin;
  }
  // In development, use localhost:5000
  return 'http://localhost:5000';
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const socketUrl = getSocketUrl();
      const newSocket = io(socketUrl);

      newSocket.on('connect', () => {
        console.log('Socket connected');
        setConnected(true);
        newSocket.emit('join', user.id);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnected(false);
      });

      newSocket.on('urgent-request', (request) => {
        toast.error(`🚨 Urgent: ${request.bloodType} blood needed!`, {
          autoClose: false
        });
      });

      newSocket.on('notification', (notification) => {
        toast.info(notification.message);
      });

      setSocket(newSocket);

      return () => newSocket.close();
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

