import { io, Socket } from 'socket.io-client';
// import { useAuthStore } from '../store/authStore';

const API_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? 'https://passion-streams-api.onrender.com'
    : 'http://localhost:5000');

let socket: Socket | null = null;

export const connectSocket = (token: string): Socket => {
  if (socket?.connected) {
    return socket;
  }

  socket = io(API_URL, {
    auth: { token },
    path: '/socket.io',
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('Socket connected');
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const joinChat = (chatId: string) => {
  if (socket) {
    socket.emit('join-chat', chatId);
  }
};

export const leaveChat = (chatId: string) => {
  if (socket) {
    socket.emit('leave-chat', chatId);
  }
};

export const sendSocketMessage = (chatId: string, content: string, type = 'TEXT') => {
  if (socket) {
    socket.emit('send-message', { chatId, content, type });
  }
};

export const onNewMessage = (callback: (message: any) => void) => {
  if (socket) {
    socket.on('new-message', callback);
  }
  return () => {
    if (socket) {
      socket.off('new-message', callback);
    }
  };
};

export const onTyping = (callback: (data: { userId: string; isTyping: boolean }) => void) => {
  if (socket) {
    socket.on('user-typing', callback);
  }
  return () => {
    if (socket) {
      socket.off('user-typing', callback);
    }
  };
};

export const emitTyping = (chatId: string, isTyping: boolean) => {
  if (socket) {
    socket.emit('typing', { chatId, isTyping });
  }
};

