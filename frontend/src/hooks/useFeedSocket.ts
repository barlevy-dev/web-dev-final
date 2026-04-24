import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { socketService } from '@/services/socket.service';
import { useAuth } from './useAuth';

export function useFeedSocket() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = socketService.connect();

    socket.emit('feed:subscribe');

    socket.on('post:created', () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    });

    socket.on('post:liked', () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    });

    return () => {
      socket.emit('feed:unsubscribe');
      socket.off('post:created');
      socket.off('post:liked');
    };
  }, [isAuthenticated, queryClient]);
}
