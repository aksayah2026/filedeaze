import axiosInstance from './axiosInstance';
import { ApiResponse, User, TechnicianLocation } from '../types';

export const technicianApi = {
  getAll: async () => {
    const response = await axiosInstance.get<ApiResponse<User[]>>('/technicians');
    return response.data;
  },
  
  create: async (data: Partial<User>) => {
    const response = await axiosInstance.post<ApiResponse<User>>('/technicians', data);
    return response.data;
  },
  
  getDetails: async (id: string) => {
    const response = await axiosInstance.get<ApiResponse<User>>(`/technicians/${id}`);
    return response.data;
  },

  update: async (id: string, data: Partial<User>) => {
    const response = await axiosInstance.put<ApiResponse<User>>(`/technicians/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axiosInstance.delete<ApiResponse<any>>(`/technicians/${id}`);
    return response.data;
  },
  
  getLocations: async () => {
    const response = await axiosInstance.get<ApiResponse<TechnicianLocation[]>>('/private/technician-location');
    return response.data;
  },
  
  updateStatus: async (id: string, enabled: boolean) => {
    const response = await axiosInstance.patch<ApiResponse<any>>('/private/admin/customers/status', null, { params: { id, enabled } });
    return response.data;
  }
};
