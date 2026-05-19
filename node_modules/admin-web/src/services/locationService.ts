import axiosInstance from '../api/axiosInstance';

export interface LiveLocation {
  technicianId: string;
  name: string;
  phoneNumber: string;
  latitude: number;
  longitude: number;
  status: 'AVAILABLE' | 'ON_JOB' | 'ON_THE_WAY' | 'OFFLINE';
  lastUpdated: string;
}

export const locationService = {
  getLiveLocations: async (): Promise<LiveLocation[]> => {
    const response = await axiosInstance.get('/admin/technician/live-locations');
    return response.data?.data || response.data;
  }
};
