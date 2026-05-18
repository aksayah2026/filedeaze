import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useEffect } from 'react';
import { ticketApi } from '../api/ticketApi';
import { attachmentApi } from '../api/attachmentApi';
import { socketService } from '../sockets/socketService';
import { extractApiData } from '../lib/utils';

export const useTickets = (filters?: any) => {
  const queryClient = useQueryClient();

  // WebSocket: invalidate tickets when new ones arrive
  useEffect(() => {
    let connected = false;
    socketService.connect().then(() => {
      connected = true;
      socketService.subscribeToTickets(() => {
        queryClient.invalidateQueries('tickets');
      });
    }).catch(() => {
      // WebSocket not available — polling fallback handled by refetchInterval
    });

    return () => {
      if (connected) {
        socketService.unsubscribe('/topic/service-requests');
      }
    };
  }, [queryClient]);

  return useQuery(['tickets', filters], () => ticketApi.getAll(filters), {
    select: extractApiData,
    refetchInterval: 30000, // poll every 30s as fallback
    staleTime: 10000,
    retry: 2,
  });
};

export const useTicket = (id: string) => {
  return useQuery(['ticket', id], () => ticketApi.getById(id), {
    enabled: !!id,
    select: (response) => response.data,
    staleTime: 5000,
  });
};

export const useTicketAttachments = (requestId: string | undefined) => {
  return useQuery(
    ['ticket-attachments', requestId],
    () => attachmentApi.getByRequestId(requestId!),
    {
      enabled: !!requestId,
      select: (response) => {
        const raw = response.data ?? [];
        return Array.isArray(raw) ? raw : [];
      },
      staleTime: 30000,
    }
  );
};

export const useUpdateTicketStatus = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ id, status }: { id: string; status: string }) => ticketApi.updateStatus(id, status),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('tickets');
        queryClient.invalidateQueries('ticket');
      },
    }
  );
};

export const useAssignTechnician = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ id, technicianId, scheduledDate, scheduledTime }: { id: string; technicianId: string; scheduledDate: string; scheduledTime: string }) =>
      ticketApi.assignTechnician(id, technicianId, scheduledDate, scheduledTime),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('tickets');
        queryClient.invalidateQueries('ticket');
      },
    }
  );
};
