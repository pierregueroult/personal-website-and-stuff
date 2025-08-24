'use client';

import { useEffect, useState } from 'react';

import { socket } from '@/sockets/chat';

export function useChatSocket(): {
  messages: string[];
  isConnected: boolean;
  handleConnection: () => void;
} {
  const [messages, setMessages] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(socket.connected);

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
    });
    socket.on('disconnect', () => {
      setIsConnected(false);
    });
    socket.on('chat', (message: string) => {
      console.log('Received message:', message);
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleConnection = () => {
    if (!socket.connected) {
      socket.connect();
    }
  };

  return { messages, isConnected, handleConnection };
}
