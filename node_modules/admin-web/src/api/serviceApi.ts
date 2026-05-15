import axiosInstance from './axiosInstance';
import { ApiResponse, Service } from '../types';

export const serviceApi = {
  getAll: async () => {
    const response = await axiosInstance.get<ApiResponse<Service[]>>('/public/services');
    return response.data;
  },
  
  create: async (service: Partial<Service>) => {
    const response = await axiosInstance.post<ApiResponse<Service>>('/private/admin/services', service);
    return response.data;
  },
  
  update: async (id: string, service: Partial<Service>) => {
    const response = await axiosInstance.put<ApiResponse<Service>>(`/private/admin/services/${id}`, service);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await axiosInstance.delete<ApiResponse<null>>(`/private/admin/services/${id}`);
    return response.data;
  }
};
