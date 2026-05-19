import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { socketService } from '../sockets/socketService';
import axiosInstance from '../api/axiosInstance';
import { useQuery, useMutation, useQueryClient } from 'react-query';

export const useNotifications = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery(
    ['notifications', user?.userId],
    async () => {
      if (!user?.userId) return [];
      const response = await axiosInstance.get(`/private/notifications/${user.userId}`);
      return response.data.data || [];
    },
    {
      enabled: !!user?.userId,
    }
  );

  useEffect(() => {
    if (!user?.userId) return;

    socketService.connect();
    const subscription = socketService.subscribeToUserNotifications(user.userId, (message) => {
      queryClient.setQueryData(['notifications', user.userId], (old: any) => [message, ...(old || [])]);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [user?.userId, queryClient]);

  const markAsReadMutation = useMutation(
    (notificationId: string) => axiosInstance.put(`/private/notifications/${notificationId}/read`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['notifications', user?.userId]);
      },
    }
  );

  return {
    notifications: notifications || [],
    unreadCount: (notifications || []).filter((n: any) => !n.read).length,
    markAsRead: markAsReadMutation.mutate,
  };
};
