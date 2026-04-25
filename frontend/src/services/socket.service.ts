import { io, Socket } from 'socket.io-client';
import { tokenManager } from './tokenManager';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://localhost:5001';

let socket: Socket | null = null;

export const socketService = {
  connect: (): Socket => {
    if (socket?.connected) return socket;

    socket = io(BACKEND_URL, {
      auth: { token: tokenManager.getToken() },
      transports: ['websocket', 'polling'],
    });

    return socket;
  },

  disconnect: () => {
    socket?.disconnect();
    socket = null;
  },

  getSocket: () => socket,
};
