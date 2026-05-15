import axiosInstance from './axiosInstance';
import { ApiResponse, Category, AppService } from '../types';

export const settingsApi = {
  // Categories
  getCategories: async () => {
    const response = await axiosInstance.get<ApiResponse<Category[]>>('/public/categories');
    return response.data;
  },
  
  createCategory: async (data: any) => {
    const response = await axiosInstance.post<ApiResponse<Category>>('/private/admin/categories', data);
    return response.data;
  },
  
  // Services
  getServices: async () => {
    const response = await axiosInstance.get<ApiResponse<AppService[]>>('/public/services');
    return response.data;
  },
  
  createService: async (data: any) => {
    const response = await axiosInstance.post<ApiResponse<AppService>>('/private/admin/services', data);
    return response.data;
  },
  
  updateService: async (id: string, data: any) => {
    const response = await axiosInstance.put<ApiResponse<AppService>>(`/private/admin/services/${id}`, data);
    return response.data;
  },
  
  deleteService: async (id: string) => {
    const response = await axiosInstance.delete<ApiResponse<any>>(`/private/admin/services/${id}`);
    return response.data;
  }
};
