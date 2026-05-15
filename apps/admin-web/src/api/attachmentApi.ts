import axiosInstance from './axiosInstance';
import { ApiResponse, ServiceRequestAttachmentItem } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const attachmentApi = {
  getByRequestId: async (requestId: string) => {
    const response = await axiosInstance.get<ApiResponse<ServiceRequestAttachmentItem[]>>(
      `/private/service-request-attachments/request/${requestId}`
    );
    return response.data;
  },

  getAll: async () => {
    const response = await axiosInstance.get<ApiResponse<ServiceRequestAttachmentItem[]>>(
      `/private/service-request-attachments/all`
    );
    return response.data;
  },

  /** Builds a full URL for an attachment's fileUrl */
  getFullUrl: (fileUrl: string): string => {
    if (!fileUrl) return '';
    if (fileUrl.startsWith('http')) return fileUrl;
    return `${BASE_URL.replace('/api', '')}${fileUrl}`;
  },
};
