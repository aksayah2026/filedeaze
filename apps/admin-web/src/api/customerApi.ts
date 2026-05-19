import axiosInstance from './axiosInstance';
import { ApiResponse, User } from '../types';

export const customerApi = {
  getAll: async (params?: any) => {
    const response = await axiosInstance.get<ApiResponse<User[]>>('/private/admin/customers', { params });
    return response.data;
  },

  getDetails: async (id: string) => {
    const response = await axiosInstance.get<ApiResponse<User>>(`/private/admin/customers/${id}`);
    return response.data;
  },

  updateStatus: async (id: string, enabled: boolean) => {
    const response = await axiosInstance.patch<ApiResponse<any>>('/private/admin/customers/status', null, { params: { id, enabled } });
    return response.data;
  },

  deleteCustomer: async (id: string) => {
    const response = await axiosInstance.delete<ApiResponse<any>>(`/private/admin/customers/${id}`);
    return response.data;
  },
};

