import axiosInstance from './axiosInstance';
import { ApiResponse, ServiceRequest } from '../types';

export const ticketApi = {
  getAll: async (filters?: any) => {
    const response = await axiosInstance.get<ApiResponse<ServiceRequest[]>>('/private/service-request', { params: filters });
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await axiosInstance.get<ApiResponse<ServiceRequest>>(`/private/service-request/${id}`);
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await axiosInstance.post<ApiResponse<ServiceRequest>>('/private/service-request', data);
    return response.data;
  },
  
  update: async (id: string, data: any) => {
    const response = await axiosInstance.put<ApiResponse<ServiceRequest>>(`/private/service-request/${id}`, data);
    return response.data;
  },
  
  assignTechnician: async (requestId: string, technicianId: string, scheduledDate: string, scheduledTime: string) => {
    const response = await axiosInstance.post<ApiResponse<any>>('/private/service-request/assign-technician', {
      requestId,
      technicianId,
      scheduledDate,
      scheduledTime
    });
    return response.data;
  },
  
  updateStatus: async (id: string, status: string) => {
    const response = await axiosInstance.put<ApiResponse<any>>(`/private/service-request/${id}/status`, { status });
    return response.data;
  },

  cancel: async (id: string) => {
    const response = await axiosInstance.post<ApiResponse<any>>(`/private/service-request/${id}/cancel`);
    return response.data;
  },
};
