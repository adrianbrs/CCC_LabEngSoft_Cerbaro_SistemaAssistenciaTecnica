import type {
  ICoreClientEventHandlers,
  ICoreServerEventHandlers,
} from '@musat/core';
import type { Server, Socket } from 'socket.io';

export type ApiSocketServer = Server<
  ICoreServerEventHandlers,
  ICoreClientEventHandlers
>;

export type ApiSocket = Socket<
  ICoreServerEventHandlers,
  ICoreClientEventHandlers
>;
