import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server } from 'socket.io';
import { SessionMiddleware } from '../../modules/auth/session.middleware';
import { INestApplicationContext } from '@nestjs/common';
import { Session, SessionData } from 'express-session';
import { AuthData } from '../../modules/auth/auth.interface';
import { WsException } from '@nestjs/websockets';
import { User } from '../../modules/user/models/user.entity';

export class ApiWebSocketAdapter extends IoAdapter {
  declare protected readonly httpServer: Server;

  constructor(private readonly app: INestApplicationContext) {
    super(app);
  }

  createIOServer(port: number, options?: unknown): Server {
    const sessionMiddleware = this.app.get(SessionMiddleware);

    const io = super.createIOServer(port, options) as Server;

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
