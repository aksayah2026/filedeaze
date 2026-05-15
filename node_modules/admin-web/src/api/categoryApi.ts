import axiosInstance from './axiosInstance';
import { ApiResponse, Category } from '../types';

export const categoryApi = {
  getAll: async () => {
    const response = await axiosInstance.get<ApiResponse<Category[]>>('/public/categories');
    return response.data;
  },
  
  create: async (category: Partial<Category>) => {
    const response = await axiosInstance.post<ApiResponse<Category>>('/private/admin/categories', category);
    return response.data;
  },
  
  update: async (id: string, category: Partial<Category>) => {
    const response = await axiosInstance.put<ApiResponse<Category>>(`/private/admin/categories/${id}`, category);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await axiosInstance.delete<ApiResponse<null>>(`/private/admin/categories/${id}`);
    return response.data;
  }
};
