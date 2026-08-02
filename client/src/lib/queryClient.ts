import { QueryClient, InfiniteData } from "@tanstack/react-query";
import { Message } from "@/utils/contracts";
import { ChatMeta } from "@/utils/contracts";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});

type ChatsPage = { items: ChatMeta[]; page: number; totalPages: number };
type ChatsCache = InfiniteData<ChatsPage>;

function patchPage(
  page: ChatsPage,
  chatId: number,
  patch: Partial<ChatMeta>,
): ChatsPage {
  return {
    ...page,
    items: page.items.map((chat) =>
      chat.id === chatId ? { ...chat, ...patch } : chat,
    ),
  };
}

export function patchChatInCache(
  userId: number,
  chatId: number,
  patch: Partial<ChatMeta>,
) {
  queryClient.setQueryData<ChatsCache>(["chats", userId], (old) => {
    if (!old) return old;
    return {
      ...old,
      pages: old.pages.map((page) => patchPage(page, chatId, patch)),
    };
  });
}

export function updateLastMessageInCache(
  userId: number,
  message: Message,
  currentUserId: number,
) {
  patchChatInCache(userId, message.chat_id, {
    lastMessage: {
      content: message.content,
      createdAt: message.createdAt,
      isOwn: message.sender.id === currentUserId,
    },
    updatedAt: message.createdAt,
  });
}

export function incrementUnreadInCache(userId: number, chatId: number) {
  const old = queryClient.getQueryData<ChatsCache>(["chats", userId]);
  if (!old) return;

  const current =
    old.pages.flatMap((p) => p.items).find((c) => c.id === chatId)
      ?.unreadCount ?? 0;

  patchChatInCache(userId, chatId, { unreadCount: current + 1 });
}

export function clearUnreadInCache(userId: number, chatId: number) {
  patchChatInCache(userId, chatId, { unreadCount: 0 });
}

export function getChatFromCache(
  userId: number,
  chatId: number,
): ChatMeta | undefined {
  const data = queryClient.getQueryData<ChatsCache>(["chats", userId]);
  return data?.pages.flatMap((p) => p.items).find((c) => c.id === chatId);
}

export default queryClient;

export function invalidateMessagesQuery(chatId: number) {
  queryClient.invalidateQueries({ queryKey: ["messages", chatId] });
}

type MessagesPage = { items: Message[]; page: number; totalPages: number };
type MessagesCache = InfiniteData<MessagesPage>;

export function addMessageToCache(chatId: number, message: Message) {
  queryClient.setQueryData<MessagesCache>(["messages", chatId], (old) => {
    if (!old) return old;

    const alreadyExists = old.pages.some((page) =>
      page.items.some(
        (m) => m.id === message.id && m.chat_id === message.chat_id,
      ),
    );

    if (alreadyExists) return old;

    return {
      ...old,
      pages: old.pages.map((page, index) =>
        index === 0 ? { ...page, items: [message, ...page.items] } : page,
      ),
    };
  });
}
