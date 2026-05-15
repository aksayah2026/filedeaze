import axiosInstance from './axiosInstance';
import { ApiResponse, AuthResponse } from '../types';

export const authApi = {
  login: async (credentials: any) => {
    const response = await axiosInstance.post<ApiResponse<AuthResponse>>('/public/auth/login', credentials);
    return response.data;
  },
  
  signup: async (userData: any) => {
    const response = await axiosInstance.post<ApiResponse<any>>('/public/auth/signup', userData);
    return response.data;
  },
  
  refreshToken: async (refreshToken: string) => {
    const response = await axiosInstance.post<ApiResponse<{ token: string }>>('/public/auth/refresh', { refreshToken });
    return response.data;
  },
  
  logout: async (refreshToken: string) => {
    const response = await axiosInstance.post<ApiResponse<any>>('/public/auth/logout', { refreshToken });
    return response.data;
  }
};
