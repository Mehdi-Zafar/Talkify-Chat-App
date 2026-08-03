import { io, Socket } from "socket.io-client";
import { create } from "zustand";
import useAuthStore from "./AuthStore";
import { Message, SocketEvent } from "@/utils/contracts";
import useChatStore from "./ChatStore";
import useUserStore from "./UserStore";
import {
  updateLastMessageInCache,
  incrementUnreadInCache,
  invalidateMessagesQuery,
  addMessageToCache,
} from "@/lib/queryClient";

type SocketState = {
  socket: Socket | null;
  isConnected: boolean;
  error: Error | null;
  connect: () => void;
  disconnect: () => void;
  emit: (event: string, ...args: any[]) => void;
  on: (event: string, callback: (...args: any[]) => void) => void;
  off: (event: string, callback?: (...args: any[]) => void) => void;
};

const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  isConnected: false,
  error: null,

  connect: () => {
    get().disconnect();
    const url = "http://localhost:3000";
    const authToken = useAuthStore.getState().accessToken;

    try {
      const newSocket = io(url, {
        autoConnect: true,
        withCredentials: true,
        ...(authToken && { auth: { token: authToken } }),
      });

      newSocket.on(SocketEvent.CONNECT, () => {
        set({ isConnected: true, error: null });
      });

      newSocket.on(SocketEvent.DISCONNECT, () => {
        set({ isConnected: false });
      });

      newSocket.on(SocketEvent.RECEIVE_MSG, (message: Message) => {
        const currentUser = useUserStore.getState().user;
        if (!currentUser) return;

        const activeChatId = useChatStore.getState().activeChatId;

        updateLastMessageInCache(currentUser.id, message, currentUser.id);

        if (message.chat_id !== activeChatId) {
          incrementUnreadInCache(currentUser.id, message.chat_id);
          invalidateMessagesQuery(message.chat_id);
        }
      });

      newSocket.on(SocketEvent.MSG_SENT, (message: Message) => {
        const currentUser = useUserStore.getState().user;
        if (!currentUser) return;

        addMessageToCache(message.chat_id, message);
      });

      newSocket.on("connect_error", async (err) => {
        set({ error: new Error(`Connection error: ${err.message}`) });

        if (err.message === "TOKEN_EXPIRED") {
          try {
            await useAuthStore.getState().refreshAccessToken();
            const newToken = useAuthStore.getState().accessToken;
            newSocket.auth = { token: newToken };
            newSocket.connect();
          } catch {
            useAuthStore.getState().logout();
          }
        }
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
}));

export default useSocketStore;
