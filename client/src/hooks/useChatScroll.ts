import { useCallback, useEffect, useRef, useState } from "react";
import { Message } from "@/utils/contracts";

interface UseChatScrollParams {
  messages: Message[];
  isFirstLoad: React.MutableRefObject<boolean>;
  data:
    | { pages: { items: Message[]; page: number; totalPages: number }[] }
    | undefined;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  unreadCount: number;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
}

export function useChatScroll({
  messages,
  isFirstLoad,
  data,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  unreadCount,
  setMessages,
  setUnreadCount,
}: UseChatScrollParams) {
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef<number>(0);
  const [activeDateLabel, setActiveDateLabel] = useState("");

  // Scroll to bottom only on first load of this chat
  useEffect(() => {
    if (!messages.length || !isFirstLoad.current) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
    isFirstLoad.current = false;
  }, [messages.length, isFirstLoad]);

  // Prepend older messages when a new page loads — preserve scroll position
  useEffect(() => {
    if (!data?.pages || data.pages.length <= 1) return;

    const latestPage = data.pages[data.pages.length - 1];
    const olderMessages = [...latestPage.items].reverse();

    const container = containerRef.current;
    if (container) {
      prevScrollHeightRef.current = container.scrollHeight;
    }

    setMessages((prev) => [...olderMessages, ...prev]);

    requestAnimationFrame(() => {
      if (container) {
        const newScrollHeight = container.scrollHeight;
        container.scrollTop = newScrollHeight - prevScrollHeightRef.current;
      }
    });
  }, [data?.pages.length, data?.pages, setMessages]);

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    // Sticky date label tracking
    const markers = container.querySelectorAll<HTMLElement>("[data-date]");
    let current = "";
    markers.forEach((marker) => {
      if (marker.offsetTop <= container.scrollTop + 10) {
        current = marker.getAttribute("data-date") || "";
      }
    });
    setActiveDateLabel(current);

    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      150;

    if (isNearBottom && unreadCount > 0) {
      setUnreadCount(0);
    }

    if (container.scrollTop < 100 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    unreadCount,
    setUnreadCount,
  ]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return { containerRef, messagesEndRef, activeDateLabel };
}
