"use client";

import { createContext, useContext, useEffect, useRef, useCallback } from "react";
import type { Socket } from "socket.io-client";
import { createSocket, closeSocket } from "@/lib/socket";

type SocketContextType = {
  getSocket: () => Socket | null;
};

const SocketContext = createContext<SocketContextType | null>(null);

export function SocketProvider({ token, children }: { token?: string; children: React.ReactNode }) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) return;
    socketRef.current = createSocket(token);
    return () => {
      closeSocket();
      socketRef.current = null;
    };
  }, [token]);

  const getSocket = useCallback(() => socketRef.current, []);
  return <SocketContext.Provider value={{ getSocket }}>{children}</SocketContext.Provider>;
}

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within <SocketProvider>");
  return ctx;
};
