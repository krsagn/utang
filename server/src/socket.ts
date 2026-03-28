import { Server } from 'socket.io';
import { type Server as HttpServer } from 'http';
import { lucia } from './auth.js';

export let io: Server;

export function initSocket(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true },
  });

  io.use(async (socket, next) => {
    const sessionId = lucia.readSessionCookie(
      socket.handshake.headers.cookie ?? ''
    );
    if (!sessionId) return next(new Error('Unauthorised'));

    const { user, session } = await lucia.validateSession(sessionId);
    if (!session) return next(new Error('Unauthorised'));

    socket.data.user = user;
    next();
  });

  io.on('connection', (socket) => {
    const userId = socket.data.user.id;
    socket.join(userId);
  });

  return io;
}
