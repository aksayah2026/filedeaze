import axiosInstance from './axiosInstance';
import { ApiResponse, DashboardStats } from '../types';

export const dashboardApi = {
  getStats: async () => {
    const response = await axiosInstance.get<ApiResponse<DashboardStats>>('/private/admin/dashboard/stats');
    return response.data;
  }
};
