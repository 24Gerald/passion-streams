import { api } from './api';
import type { Chat, ChatMessage } from '@/shared/types';

export const chatService = {
  getChats: async (): Promise<Chat[]> => {
    const response = await api.get<Chat[]>('/api/chat');
    return response.data;
  },

  getMessages: async (chatId: string): Promise<ChatMessage[]> => {
    const response = await api.get<ChatMessage[]>(`/api/chat/${chatId}/messages`);
    return response.data;
  },

  sendMessage: async (chatId: string, content: string, type = 'TEXT'): Promise<ChatMessage> => {
    const response = await api.post<ChatMessage>(`/api/chat/${chatId}/messages`, { content, type });
    return response.data;
  },

  inviteAdmin: async (chatId: string): Promise<void> => {
    await api.post(`/api/chat/${chatId}/invite-admin`);
  },

  createChat: async (type: string, module?: string): Promise<Chat> => {
    const response = await api.post<Chat>('/api/chat', { type, module });
    return response.data;
  },
};

