// Socket.io event handlers are initialized in src/config/socket.ts
// This file re-exports the emit helpers for convenience

export { emitPostEvent, emitCommentEvent, getIO } from '../config/socket';
