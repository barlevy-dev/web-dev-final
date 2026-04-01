import { Server as HTTPSServer } from 'https';
import { Server as SocketIOServer } from 'socket.io';
import { verifyAccessToken } from '../services/auth.service';

let io: SocketIOServer;

export const initializeSocket = (server: HTTPSServer): SocketIOServer => {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'https://localhost:3000',
      credentials: true,
    },
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = verifyAccessToken(token);
      socket.data.user = decoded;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.data.user.userId}`);

    // Feed subscription
    socket.on('feed:subscribe', () => {
      socket.join('feed');
    });

    socket.on('feed:unsubscribe', () => {
      socket.leave('feed');
    });

    // Post-specific subscription
    socket.on('post:subscribe', (postId: string) => {
      socket.join(`post:${postId}`);
    });

    socket.on('post:unsubscribe', (postId: string) => {
      socket.leave(`post:${postId}`);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.data.user.userId}`);
    });
  });

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

// Emit helpers for use in services
export const emitPostEvent = (event: string, data: unknown) => {
  if (io) {
    io.to('feed').emit(event, data);
  }
};

export const emitCommentEvent = (postId: string, event: string, data: unknown) => {
  if (io) {
    io.to(`post:${postId}`).emit(event, data);
  }
};
