import { useQuery, useMutation, useQueryClient } from 'react-query';
import { ticketService } from '../services/ticketService';
import { dashboardService } from '../services/apiServices';

export const useTickets = () => {
  return useQuery('tickets', ticketService.getTickets);
};

export const useTicket = (id: string) => {
  return useQuery(['ticket', id], () => ticketService.getTicketById(id), {
    enabled: !!id,
  });
};

export const useDashboardStats = () => {
  return useQuery('dashboardStats', dashboardService.getStats, {
    refetchInterval: 30000, // Refresh every 30s
  });
};

export const useUpdateTicketStatus = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ id, status }: { id: string; status: string }) => 
      ticketService.updateStatus(id, status),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('tickets');
      },
    }
  );
};
