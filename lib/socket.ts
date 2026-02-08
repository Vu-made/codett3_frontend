import { io, Socket } from "socket.io-client";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL!;
let socket: Socket | null = null;

export const createSocket = (token: string) => {
  if (!socket) {
    socket = io(WS_URL, {
      transports: ["websocket"],
      query: { token },
    });

    socket.on("connect", () => console.log("✅ Connected:", socket?.id));
    socket.on("disconnect", (r) => console.log("❌ Disconnected:", r));
    socket.on("connect_error", (err) => console.error("⚠️ Socket error:", err.message));
  }
  return socket;
};

export const getSocket = () => socket;
export const closeSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
