import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { socketService } from '@/services/socket.service';
import { useAuth } from './useAuth';

export function usePostSocket(postId: string) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated || !postId) return;

    const socket = socketService.connect();

    socket.emit('post:subscribe', postId);

    socket.on('comment:created', () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
    });

    return () => {
      socket.emit('post:unsubscribe', postId);
      socket.off('comment:created');
    };
  }, [isAuthenticated, postId, queryClient]);
}
