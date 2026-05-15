import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string, refreshToken?: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, token, refreshToken) => {
        console.log('[AuthStore] setAuth called — user:', user?.username, '| role:', user?.role);
        // Persist to localStorage as source of truth
        localStorage.setItem('token', token);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        set({ user, token, refreshToken: refreshToken ?? null, isAuthenticated: true });
      },

      logout: () => {
        console.log('[AuthStore] Logging out');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
        window.location.href = '/login';
      },
    }),
    {
      name: 'auth-storage',
      // Only persist these keys — token state syncs with localStorage separately
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
