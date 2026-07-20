import { api } from './api';

export interface AdminDashboardStats {
  stats: {
    totalUsers: number;
    totalPosts: number;
    pendingPosts: number;
  };
}

export interface ModerationPost {
  id: string;
  content: string;
  module: string;
  status: string;
  createdAt: string;
  userId?: { fullName?: string };
}

export const adminService = {
  getDashboard: async (): Promise<AdminDashboardStats> => {
    const response = await api.get<AdminDashboardStats>('/api/admin/dashboard');
    return response.data;
  },

  getModerationQueue: async (): Promise<{ posts: ModerationPost[] }> => {
    const response = await api.get<{ posts: ModerationPost[] }>('/api/admin/moderation?type=posts');
    return response.data;
  },

  approvePost: async (postId: string): Promise<void> => {
    await api.post(`/api/admin/moderation/posts/${postId}/approve`);
  },

  rejectPost: async (postId: string, reason: string): Promise<void> => {
    await api.post(`/api/admin/moderation/posts/${postId}/reject`, { reason });
  },
};
