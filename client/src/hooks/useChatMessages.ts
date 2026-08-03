import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { ChatAPI } from "@/api";
import { getChatFromCache } from "@/lib/queryClient";
import { useUserStore } from "@/zustand";
import { Message } from "@/utils/contracts";

const LIMIT = 30;

export function useChatMessages(chatId: number) {
  const user = useUserStore((state) => state.user);
  const [messages, setMessages] = useState<Message[]>([]);
  const isFirstLoad = useRef(true);

  const chatMetaCache = user ? getChatFromCache(user.id, chatId) : undefined;
  console.log(chatMetaCache);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isFetching } =
    useInfiniteQuery({
      queryKey: ["messages", chatId],
      queryFn: ({ pageParam = 1 }) =>
        ChatAPI.getChatMessages(chatId, pageParam, LIMIT),
      getNextPageParam: (lastPage) =>
        lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
      initialPageParam: 1,
      enabled: !!chatId && !isNaN(chatId),
    });

  const { data: fetchedChatMeta } = useQuery({
    queryKey: ["chatMeta", chatId],
    queryFn: () => ChatAPI.getChatMeta(chatId),
    enabled: !chatMetaCache && !!chatId,
  });

  const chatMeta = chatMetaCache ?? fetchedChatMeta;

  // Seed local messages from the first page only
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!data?.pages?.length) return;
    const firstPage = data.pages[0];
    const initialMessages = [...firstPage.items].reverse();
    setMessages(initialMessages);
    isFirstLoad.current = true;
  }, [data?.pages[0]]);

  return {
    messages,
    setMessages,
    isFirstLoad,
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    chatMeta,
  };
}
