import axiosInstance from '../api/axiosInstance';

export const userService = {
  getProfile: async () => {
    const response = await axiosInstance.get('/users/profile');
    return response.data;
  },
  
  updateProfile: async (data: any) => {
    const response = await axiosInstance.put('/users/profile', data);
    return response.data;
  },

  getAllUsers: async () => {
    const response = await axiosInstance.get('/users');
    return response.data;
  }
};

export const technicianService = {
  getAvailableTechnicians: async () => {
    const response = await axiosInstance.get('/technicians/available');
    return response.data;
  },

  updateLocation: async (lat: number, lng: number) => {
    const response = await axiosInstance.post('/technicians/location', { lat, lng });
    return response.data;
  }
};

export const dashboardService = {
  getStats: async () => {
    const response = await axiosInstance.get('/dashboard/stats');
    return response.data;
  },

  getRecentActivity: async () => {
    const response = await axiosInstance.get('/dashboard/activity');
    return response.data;
  }
};
