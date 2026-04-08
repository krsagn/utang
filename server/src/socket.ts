import { Server } from 'socket.io';
import { type Server as HttpServer } from 'http';
import { lucia } from './auth.js';
import { createAdapter } from '@socket.io/redis-adapter';
import { createRedisConnection } from './db/redis.js';

export let io: Server;

export function initSocket(httpServer: HttpServer) {
  if (io) return io;

  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  const pubClient = createRedisConnection();
  const subClient = pubClient.duplicate();

  pubClient.on('error', (err) => console.error('Redis pub client error:', err));
  subClient.on('error', (err) => console.error('Redis sub client error:', err));

  io.adapter(createAdapter(pubClient, subClient));

  io.use(async (socket, next) => {
    try {
      const sessionId = lucia.readSessionCookie(
        socket.handshake.headers.cookie ?? ''
      );
      if (!sessionId) return next(new Error('Unauthorised'));

      const { user, session } = await lucia.validateSession(sessionId);
      if (!session) return next(new Error('Unauthorised'));

      socket.data.user = user;
      next();
    } catch (err) {
      next(err instanceof Error ? err : new Error('Internal server error'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.user.id;
    socket.join(userId);
  });

  return io;
}
