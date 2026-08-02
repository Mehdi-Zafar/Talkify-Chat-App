import { create } from "zustand";

interface ChatStore {
  activeChatId: number | null;
  setActiveChatId: (id: number | null) => void;
}

const useChatStore = create<ChatStore>((set) => ({
  activeChatId: null,
  setActiveChatId: (id) => set({ activeChatId: id }),
}));

export default useChatStore;
