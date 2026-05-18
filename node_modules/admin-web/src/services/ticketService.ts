import axiosInstance from '../api/axiosInstance';
import { Ticket } from '@fieldeaze/types';

export const ticketService = {
  getTickets: async () => {
    const response = await axiosInstance.get<Ticket[]>('/tickets');
    return response.data;
  },

  getTicketById: async (id: string) => {
    const response = await axiosInstance.get<Ticket>(`/tickets/${id}`);
    return response.data;
  },

  createTicket: async (data: Partial<Ticket>) => {
    const response = await axiosInstance.post<Ticket>('/tickets', data);
    return response.data;
  },

  updateStatus: async (id: string, status: string) => {
    const response = await axiosInstance.patch<Ticket>(`/tickets/${id}/status?status=${status}`);
    return response.data;
  },

  assignTechnician: async (ticketId: string, technicianId: string) => {
    const response = await axiosInstance.post<Ticket>('/tickets/assign', { ticketId, technicianId });
    return response.data;
  },
};
