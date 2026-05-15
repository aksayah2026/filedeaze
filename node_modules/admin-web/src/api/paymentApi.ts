import axiosInstance from './axiosInstance';
import { ApiResponse } from '../types';

export const paymentApi = {
  getAll: async (params?: any) => {
    const response = await axiosInstance.get<ApiResponse<any[]>>('/private/payments', { params });
    return response.data;
  },
  
  initiate: async (bookingId: string, amount: number) => {
    const response = await axiosInstance.post<ApiResponse<any>>('/private/payments/initiate', { bookingId, amount });
    return response.data;
  },
  
  verify: async (bookingId: string, paymentData: any) => {
    const response = await axiosInstance.post<ApiResponse<any>>(`/private/payments/verify/${bookingId}`, paymentData);
    return response.data;
  }
};
