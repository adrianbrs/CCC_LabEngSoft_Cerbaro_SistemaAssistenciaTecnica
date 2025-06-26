import { io } from "socket.io-client";

// Hardcoded URL for development until we setup a proper WebSocket proxy
const WS_URL =
  process.env.NODE_ENV === "production" ? undefined : "http://localhost:3000";

export default defineNuxtPlugin(async () => {
  const { isLoggedIn } = useUserSession();
  const autoConnect = computed(() => isLoggedIn.value);

  const socket: SocketClient = io(WS_URL, {
    autoConnect: autoConnect.value,
    withCredentials: true,
    reconnection: true,
  });

  watch(autoConnect, (shouldConnect) => {
    if (!shouldConnect && socket.connected) {
      console.log("User logged out, disconnecting WebSocket");
      socket.disconnect();
    } else if (shouldConnect && !socket.connected) {
      console.log("User logged in, connecting WebSocket");
      socket.connect();
    }
  });

  socket.on("connect", () => {
    console.log("WebSocket connected");
  });

  if (autoConnect.value) {
    await new Promise<void>((resolve, reject) => {
      socket.on("connect", resolve);
      socket.on("connect_error", reject);
    }).catch((error) => {
      console.error("WebSocket connection error:", error);
    });
  }

  socket.on("disconnect", () => {
    console.warn("WebSocket disconnected");
  });

  return {
    provide: {
      socket,
    },
  };
});
