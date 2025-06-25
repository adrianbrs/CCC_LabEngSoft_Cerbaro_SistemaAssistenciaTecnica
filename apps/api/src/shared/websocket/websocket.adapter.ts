import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server } from 'socket.io';
import { SessionMiddleware } from '../../modules/auth/session.middleware';
import { INestApplicationContext } from '@nestjs/common';
import { Session, SessionData } from 'express-session';
import { AuthData } from '../../modules/auth/auth.interface';
import { WsException } from '@nestjs/websockets';
import { User } from '../../modules/user/models/user.entity';
import { ApiSocketServer, ApiSocketServerUtils } from './types';

function createApiSocketServer(io: Server): ApiSocketServer {
  const server = io as ApiSocketServer;

  const utils: ApiSocketServerUtils = {
    getByUser: (user) => {
      const userId = typeof user === 'string' ? user : user.id;
      const socketIds = server.sockets.adapter.rooms.get(userId);
      const userSocketId = socketIds?.size ? Array.from(socketIds)[0] : null;
      return userSocketId
        ? server.sockets.sockets.get(userSocketId)
        : undefined;
    },
  };

  Object.assign(server, utils);
  return server;
}

export class ApiWebSocketAdapter extends IoAdapter {
  declare protected readonly httpServer: Server;

  constructor(private readonly app: INestApplicationContext) {
    super(app);
  }

  createIOServer(port: number, options?: unknown): Server {
    const sessionMiddleware = this.app.get(SessionMiddleware);

    const io = createApiSocketServer(
      super.createIOServer(port, options) as Server,
    );

    // Load session
    io.engine.use(sessionMiddleware.use.bind(sessionMiddleware));

    // Load user data from session
    io.use((socket, next) => {
      void (async () => {
        if (socket.request.session?.userId && !socket.auth?.user) {
          const user = await User.findOne({
            where: {
              id: socket.request.session.userId,
            },
          });

          if (user) {
            socket.auth = {
              user,
            };
          }
        }

        // If no user is found in session, throw an exception
        if (!socket.auth?.user) {
          return next(new WsException('Unauthorized'));
        }

        // Join the user to their own user ID room so it's easier to send private messages
        await socket.join(socket.auth.user.id);

        next();
      })();
    });

    return io;
  }
}

declare module 'http' {
  interface IncomingMessage {
    session: Session & SessionData;
  }
}

declare module 'socket.io' {
  interface Socket {
    auth: AuthData;
  }
}
