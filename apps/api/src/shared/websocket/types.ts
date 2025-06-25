import { User } from '@/modules/user/models/user.entity';
import type {
  ICoreClientEventHandlers,
  ICoreServerEventHandlers,
} from '@musat/core';
import type { Server, Socket } from 'socket.io';

export interface ApiSocketServerUtils {
  getByUser(user: User['id'] | Pick<User, 'id'>): ApiSocket | undefined;
}

export type ApiSocketServer = Server<
  ICoreServerEventHandlers,
  ICoreClientEventHandlers
> &
  ApiSocketServerUtils;

export type ApiSocket = Socket<
  ICoreServerEventHandlers,
  ICoreClientEventHandlers
>;
