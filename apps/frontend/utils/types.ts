import type {
  ICoreClientEventHandlers,
  ICoreServerEventHandlers,
} from "@musat/core";
import type { Socket } from "socket.io-client";

export type SocketClient = Socket<
  ICoreClientEventHandlers & {
    exception: (error: unknown) => void;
  },
  ICoreServerEventHandlers
>;

export default {};
