import { CORS_ORIGIN } from '@/constants/env';
import { ISessionEvent, SessionEvents } from '@/shared/events/session';
import { ApiSocket, ApiSocketServer } from '@/shared/websocket';
import { OnEvent } from '@nestjs/event-emitter';
import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

@WebSocketGateway({
  cors: {
    origin: CORS_ORIGIN,
    credentials: true,
  },
})
export class AuthGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: ApiSocketServer;

  getSessionRoom(sessionId: string): string {
    return `session:${sessionId}`;
  }

  async handleConnection(client: ApiSocket) {
    await client.join(this.getSessionRoom(client.request.session.id));
  }

  @OnEvent(SessionEvents.LOGOUT)
  handleLogout({ sessionId }: ISessionEvent<SessionEvents.LOGOUT>) {
    // Disconnect all sockets in the session room
    this.server.in(this.getSessionRoom(sessionId)).disconnectSockets(true);
  }
}
