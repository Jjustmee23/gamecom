import React, { createContext, useContext, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useState } from 'react';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  sendMessage: (roomId: number, content: string) => void;
  joinRoom: (roomId: number) => void;
  leaveRoom: (roomId: number) => void;
  sendTyping: (roomId: number, isTyping: boolean) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (token && user) {
      // Initialize socket connection
      const socket = io(import.meta.env.VITE_WS_URL || 'ws://localhost:3001', {
        auth: {
          token
        }
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('Connected to server');
        setIsConnected(true);
        
        // Join user's rooms
        socket.emit('join-rooms');
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from server');
        setIsConnected(false);
      });

      socket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      return () => {
        socket.disconnect();
        socketRef.current = null;
      };
    }
  }, [token, user]);

  const sendMessage = (roomId: number, content: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('send-message', { roomId, content });
    }
  };

  const joinRoom = (roomId: number) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('join-room', roomId);
    }
  };

  const leaveRoom = (roomId: number) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('leave-room', roomId);
    }
  };

  const sendTyping = (roomId: number, isTyping: boolean) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('typing', { roomId, isTyping });
    }
  };

  const value = {
    socket: socketRef.current,
    isConnected,
    sendMessage,
    joinRoom,
    leaveRoom,
    sendTyping
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}; 