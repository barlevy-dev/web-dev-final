import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { socketService } from '@/services/socket.service';

export function useSocket() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = socketService.connect();

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated]);

  return socketService.getSocket();
}
