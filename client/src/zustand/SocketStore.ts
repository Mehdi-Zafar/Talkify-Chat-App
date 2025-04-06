// stores/socketStore.ts
import { io, Socket } from "socket.io-client";
import { create } from "zustand";
import useAuthStore from "./AuthStore";
import { SocketEvent } from "@/utils/contracts";

type SocketState = {
  socket: Socket | null;
  isConnected: boolean;
  error: Error | null;
  connect: () => void;
  disconnect: () => void;
  emit: (event: string, ...args: any[]) => void;
  on: (event: string, callback: (...args: any[]) => void) => void;
  off: (event: string, callback?: (...args: any[]) => void) => void;
  joinChat: (chatId: number) => void;
};

const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  isConnected: false,
  error: null,

  connect: () => {
    // Disconnect existing socket if any
    get().disconnect();
    const url = "http://localhost:3000";
    const authToken = useAuthStore.getState().accessToken;

    try {
      const socketOptions = {
        autoConnect: true,
        withCredentials: true,
        ...(authToken && { auth: { token: authToken } }),
      };

      const newSocket = io(url, socketOptions);

      newSocket.on(SocketEvent.CONNECT, () => {
        set({ isConnected: true, error: null });
      });

      newSocket.on(SocketEvent.DISCONNECT, () => {
        set({ isConnected: false });
      });

      newSocket.on(SocketEvent.CONNECT_ERROR, (err) => {
        set({ error: new Error(`Connection error: ${err.message}`) });
      });

      set({ socket: newSocket });
    } catch (err) {
      set({
        error:
          err instanceof Error
            ? err
            : new Error("Socket initialization failed"),
      });
    }
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },

  emit: (event, ...args) => {
    const { socket } = get();
    socket?.emit(event, ...args);
  },

  on: (event, callback) => {
    const { socket } = get();
    socket?.on(event, callback);
  },

  off: (event, callback) => {
    const { socket } = get();
    if (callback) {
      socket?.off(event, callback);
    } else {
      socket?.off(event);
    }
  },

  joinChat: (chatId: number) => {
    const { socket } = get();
    socket?.emit(SocketEvent.JOIN_CHAT, chatId);
  },
}));

export default useSocketStore;
