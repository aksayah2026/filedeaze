import { useQuery } from 'react-query';
import axiosInstance from '../api/axiosInstance';
import { DashboardStats } from '../types';

export const useDashboardStats = (range: string = '30d') => {
  return useQuery<DashboardStats>(['dashboardStats', range], async () => {
    const response = await axiosInstance.get(`/private/admin/dashboard/stats?range=${range}`);
    return response.data.data;
  }, {
    refetchInterval: 30000,
  });
};

export interface LiveActivityEvent {
  id: string;
  type: string;
  message: string;
  createdAt: string;
}

export const useLiveActivity = () => {
  return useQuery<LiveActivityEvent[]>('liveActivity', async () => {
    const response = await axiosInstance.get('/private/admin/dashboard/live-activity');
    return response.data.data;
  }, {
    refetchInterval: 15000,
  });
};
