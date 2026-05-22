import axiosInstance from '../api/axiosInstance';

export const superAdminService = {
  getStats: async () => {
    const response = await axiosInstance.get('/super-admin/dashboard/stats');
    return response.data;
  },

  getAllTenants: async () => {
    const response = await axiosInstance.get('/super-admin/tenants');
    return response.data;
  },

  createTenant: async (tenantData: any) => {
    const response = await axiosInstance.post('/super-admin/tenants', tenantData);
    return response.data;
  },

  updateTenant: async (id: string, tenantData: any) => {
    const response = await axiosInstance.put(`/super-admin/tenants/${id}`, tenantData);
    return response.data;
  },

  deleteTenant: async (id: string) => {
    const response = await axiosInstance.delete(`/super-admin/tenants/${id}`);
    return response.data;
  },

  getSubscriptions: async () => {
    const response = await axiosInstance.get('/super-admin/subscriptions');
    return response.data;
  },

  getGlobalAnalytics: async () => {
    const response = await axiosInstance.get('/super-admin/analytics/global');
    return response.data;
  },

  getActivityLogs: async (params?: any) => {
    const response = await axiosInstance.get('/super-admin/activity-logs', { params });
    return response.data;
  },

  getSupportTickets: async () => {
    const response = await axiosInstance.get('/super-admin/support-tickets');
    return response.data;
  },

  createSupportTicket: async (ticketData: any) => {
    const response = await axiosInstance.post('/super-admin/support-tickets', ticketData);
    return response.data;
  },

  updateSupportTicketStatus: async (id: string, status: string) => {
    const response = await axiosInstance.put(`/super-admin/support-tickets/${id}/status`, { status });
    return response.data;
  },

  getSystemSettings: async () => {
    const response = await axiosInstance.get('/super-admin/system-settings');
    return response.data;
  },

  updateSystemSettings: async (settingsData: any) => {
    const response = await axiosInstance.post('/super-admin/system-settings', settingsData);
    return response.data;
  }
};
