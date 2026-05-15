import axiosInstance from './axiosInstance';
import { ApiResponse, User, TechnicianLocation } from '../types';

export const technicianApi = {
  getAll: async () => {
    // Backend findByRole("TECHNICIAN") logic
    const response = await axiosInstance.get<ApiResponse<User[]>>('/private/users', { params: { role: 'TECHNICIAN' } });
    return response.data;
  },
  
  create: async (data: Partial<User>) => {
    const response = await axiosInstance.post<ApiResponse<User>>('/private/users', { ...data, role: 'TECHNICIAN' });
    return response.data;
  },
  
  getDetails: async (id: string) => {
    const response = await axiosInstance.get<ApiResponse<User>>(`/private/users/${id}`);
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
