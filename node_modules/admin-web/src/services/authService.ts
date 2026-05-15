import axiosInstance from '../api/axiosInstance';
import { useAuthStore } from '../store/authStore';
import { AuthResponse, ApiResponse } from '../types';

export const authService = {
  login: async (credentials: any) => {
    console.log('[AuthService] Attempting login for:', credentials.email);
    const response = await axiosInstance.post<ApiResponse<AuthResponse>>('/public/auth/login', credentials);
    
    console.log('[AuthService] Login response received:', response.data);
    
    const { token, accessToken, refreshToken, user } = response.data.data;
    const finalToken = token || accessToken;
    
    if (finalToken && user) {
      console.log('[AuthService] Storing auth data for user:', user.username, 'role:', user.role);
      useAuthStore.getState().setAuth(user, finalToken, refreshToken);
      return response.data.data;
    } else {
      const msg = (response.data as any)?.message || 'Invalid server response - missing token or user';
      console.error('[AuthService] Auth failed:', msg, response.data);
      throw new Error(msg);
    }
  },

  logout: () => {
    useAuthStore.getState().logout();
  },
};
