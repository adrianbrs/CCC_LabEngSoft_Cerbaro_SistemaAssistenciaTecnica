import { io } from "socket.io-client";

// Hardcoded URL for development until we setup a proper WebSocket proxy
const WS_URL =
  process.env.NODE_ENV === "production" ? undefined : "http://localhost:3000";

export default defineNuxtPlugin(async () => {
  const socket: SocketClient = io(WS_URL, {
    withCredentials: true,
    reconnection: true,
  });

  socket.on("connect", () => {
    console.log("WebSocket connected");
  });

  await new Promise<void>((resolve, reject) => {
    socket.on("connect", resolve);
    socket.on("connect_error", reject);
  }).catch((error) => {
    console.error("WebSocket connection error:", error);
  });

  socket.on("disconnect", () => {
    console.warn("WebSocket disconnected");
  });

  return {
    provide: {
      socket,
    },
  };
});
