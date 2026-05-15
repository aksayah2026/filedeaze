import { useQuery } from 'react-query';
import axiosInstance from '../api/axiosInstance';
import { DashboardStats } from '../types';

export const useDashboardStats = () => {
  return useQuery<DashboardStats>('dashboardStats', async () => {
    const response = await axiosInstance.get('/private/admin/dashboard/stats');
    return response.data.data;
  }, {
    refetchInterval: 30000,
  });
};
