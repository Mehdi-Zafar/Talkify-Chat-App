import { Message } from "@/utils/contracts";
import { create } from "zustand";

export interface ChatMeta {
  id: number;
  name: string;
  isGroupChat: boolean;
  memberDetails: { id: number; user_name: string; image: string }[];
  lastMessage: {
    content: string;
    createdAt: string;
    isOwn: boolean;
  } | null;
  updatedAt: string;
}

interface ChatStore {
  chatsMap: Map<number, ChatMeta>;
  unreadCounts: Map<number, number>;
  addChats: (chats: ChatMeta[]) => void;
  updateChat: (chatId: number, updates: Partial<ChatMeta>) => void;
  updateLastMessage: (message: Message, currentUserId: number) => void;
  incrementUnread: (chatId: number) => void;
  clearUnread: (chatId: number) => void;
  clearChats: () => void;
}

const useChatStore = create<ChatStore>((set) => ({
  chatsMap: new Map(),
  unreadCounts: new Map(),

  addChats: (chats) =>
    set((state) => {
      const updated = new Map(state.chatsMap);
      chats.forEach((c) => updated.set(c.id, c));
      return { chatsMap: updated };
    }),

  updateChat: (chatId, updates) =>
    set((state) => {
      const updated = new Map(state.chatsMap);
      const existing = updated.get(chatId);
      if (existing) updated.set(chatId, { ...existing, ...updates });
      return { chatsMap: updated };
    }),
  updateLastMessage: (message: Message, currentUserId: number) =>
    set((state) => {
      const updated = new Map(state.chatsMap);
      const existing = updated.get(message.chat_id);
      if (existing) {
        updated.set(message.chat_id, {
          ...existing,
          lastMessage: {
            content: message.content,
            createdAt: message.createdAt,
            isOwn: message.sender.id === currentUserId,
          },
          updatedAt: message.createdAt,
        });
      }
      return { chatsMap: updated };
    }),
  incrementUnread: (chatId) =>
    set((state) => {
      const updated = new Map(state.unreadCounts);
      updated.set(chatId, (updated.get(chatId) ?? 0) + 1);
      return { unreadCounts: updated };
    }),

  clearUnread: (chatId) =>
    set((state) => {
      const updated = new Map(state.unreadCounts);
      updated.delete(chatId);
      return { unreadCounts: updated };
    }),

  clearChats: () => set({ chatsMap: new Map() }),
}));

export default useChatStore;
