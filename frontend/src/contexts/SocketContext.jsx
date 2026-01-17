import React, { createContext, useContext, useEffect, useState } from 'react';
import socketService from '../services/socket';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    if (isAuthenticated && user) {
      const socket = socketService.connect(user._id);
      
      socket.on('connect', () => {
        setConnected(true);
        socketService.registerUser(user._id);
      });

      socket.on('disconnect', () => {
        setConnected(false);
      });

      socketService.onUserOnline((userId) => {
        setOnlineUsers((prev) => new Set([...prev, userId]));
      });

      socketService.onUserOffline((userId) => {
        setOnlineUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      });

      return () => {
        socketService.disconnect();
      };
    }
  }, [isAuthenticated, user]);

  const value = {
    socket: socketService,
    connected,
    onlineUsers,
    isUserOnline: (userId) => onlineUsers.has(userId)
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
