import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, MaritalStatus } from '@/shared/types';
import { UserRole } from '@/shared/types';
import { authService } from '../services/authService';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setGuestProfile: (age: number, maritalStatus: MaritalStatus) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

interface SignupData {
  fullName: string;
  email: string;
  password: string;
  age: number;
  location: {
    country: string;
    city: string;
  };
  maritalStatus: MaritalStatus;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isGuest: false,
      isLoading: true,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),

      setGuestProfile: (age, maritalStatus) => {
        const guestUser: User = {
          _id: 'guest',
          email: 'guest@test.local',
          fullName: 'Guest',
          age,
          location: { country: '', city: '' },
          maritalStatus,
          role: UserRole.USER,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set({
          user: guestUser,
          token: null,
          isAuthenticated: true,
          isGuest: true,
          isLoading: false,
        });
      },

      login: async (email, password) => {
        try {
          const response = await authService.login(email, password);
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      signup: async (data) => {
        try {
          const response = await authService.signup(data);
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          if (!get().isGuest) {
            await authService.logout();
          }
        } finally {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isGuest: false,
            isLoading: false,
          });
        }
      },

      checkAuth: async () => {
        try {
          const { token, isGuest, user } = get();
          if (isGuest && user) {
            set({ isAuthenticated: true, isLoading: false });
            return;
          }
          if (!token) {
            set({ isLoading: false });
            return;
          }
          const currentUser = await authService.getCurrentUser();
          set({ user: currentUser, isAuthenticated: !!currentUser, isLoading: false });
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isGuest: false,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: 'passion-streams-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token, user: state.user, isGuest: state.isGuest }),
      onRehydrateStorage: () => (state) => {
        if (state?.isGuest && state?.user) {
          state.isAuthenticated = true;
          state.isLoading = false;
        }
      },
    }
  )
);

