"use client";
import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';

let socketInstance: Socket | null = null;

export function useSocket() {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user?.sub) return;
    if (!socketInstance || !socketInstance.connected) {
      socketInstance = io('http://localhost:5000', {
        auth: { userId: user.sub },
        transports: ['websocket'],
        autoConnect: true,
      });
    }
    socketRef.current = socketInstance;
  }, [user?.sub]);

  const joinConversations = useCallback((ids: string[]) => {
    socketRef.current?.emit('join_conversations', ids);
  }, []);

  const sendMessage = useCallback((conversationId: string, content: string) => {
    socketRef.current?.emit('send_message', { conversationId, content });
  }, []);

  const sendTyping = useCallback((conversationId: string, isTyping: boolean) => {
    socketRef.current?.emit('typing', { conversationId, isTyping });
  }, []);

  const markRead = useCallback((conversationId: string) => {
    socketRef.current?.emit('mark_read', { conversationId });
  }, []);

  const on = useCallback(<T>(event: string, handler: (data: T) => void) => {
    socketRef.current?.on(event, handler);
    return () => { socketRef.current?.off(event, handler); };
  }, []);

  return { joinConversations, sendMessage, sendTyping, markRead, on };
}