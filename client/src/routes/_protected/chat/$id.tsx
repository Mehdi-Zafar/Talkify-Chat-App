import { createFileRoute } from "@tanstack/react-router";
import avatarImg from "@/assets/avatar.webp";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ChatAPI } from "@/api";
import { useEffect, useRef, useState, useCallback } from "react";
import { useSocketStore, useUserStore, useChatStore } from "@/zustand";
import { Message, SocketEvent } from "@/utils/contracts";
import { formatMessageTime, groupMessagesByDate } from "@/utils/helper";
import {
  updateLastMessageInCache,
  clearUnreadInCache,
  getChatFromCache,
} from "@/lib/queryClient";
import { EllipsisVerticalIcon } from "lucide-react";

const LIMIT = 30;

export const Route = createFileRoute("/_protected/chat/$id")({
  component: ChatDisplay,
});

function ChatDisplay() {
  const { id } = Route.useParams();
  const chatId = Number(id);

  const user = useUserStore((state) => state.user);
  const socketEmit = useSocketStore((state) => state.emit);
  const socket = useSocketStore((state) => state.socket);

  // Read chat metadata directly from TanStack cache — no Zustand needed
  const chatMeta = user ? getChatFromCache(user.id, chatId) : undefined;

  const [newMsg, setNewMsg] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeDateLabel, setActiveDateLabel] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef<number>(0);
  const isFirstLoad = useRef(true);

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

  // Seed local messages from the first page
  useEffect(() => {
    if (!data?.pages?.length) return;
    const firstPage = data.pages[0];
    const initialMessages = [...firstPage.items].reverse();
    setMessages(initialMessages);
    isFirstLoad.current = true;
  }, [data?.pages[0]]);

  // Scroll to bottom only on first load of this chat
  useEffect(() => {
    if (!messages.length || !isFirstLoad.current) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
    isFirstLoad.current = false;
  }, [messages.length]);

  // Mark chat as read and track active chat
  useEffect(() => {
    if (!chatId || !user) return;

    useChatStore.getState().setActiveChatId(chatId);
    ChatAPI.markChatAsRead(chatId);
    clearUnreadInCache(user.id, chatId);
    setUnreadCount(0);

    return () => {
      useChatStore.getState().setActiveChatId(null);
    };
  }, [chatId, user?.id]);

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
  }, [data?.pages.length]);

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
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, unreadCount]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Socket: receive new message
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: Message) => {
      debugger;
      if (message.chat_id !== chatId) return;

      setMessages((prev) => [...prev, message]);

      requestAnimationFrame(() => {
        const container = containerRef.current;
        if (!container) return;

        const isNearBottom =
          container.scrollHeight - container.scrollTop - container.clientHeight;
        150;

        if (isNearBottom) {
          container.scrollTop = container.scrollHeight;
        } else {
          setUnreadCount((prev) => prev + 1);
        }
      });
    };

    socket.on(SocketEvent.RECEIVE_MSG, handleNewMessage);
    return () => {
      socket.off(SocketEvent.RECEIVE_MSG, handleNewMessage);
    };
  }, [socket, chatId]);

  function formulateMessage() {
    const message = new Message();
    message.chat_id = chatId;
    message.sender = { ...message.sender, id: user!.id, image: user!.image };
    message.content = newMsg;
    message.createdAt = new Date().toISOString();
    return message;
  }

  function sendMessage() {
    if (!chatId || !user || !newMsg.trim()) return;
    const message = formulateMessage();
    setMessages((prev) => [...prev, message]);
    updateLastMessageInCache(user.id, message, user.id);
    socketEmit(SocketEvent.SEND_MSG, message);
    setNewMsg("");
    setUnreadCount(0);
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const groupedMessages = groupMessagesByDate(messages ?? []);

  if (isFetching && !data) {
    return (
      <div className="h-full flex justify-center items-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-lightPrimary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-between h-screen">
      <div className="w-full h-full flex flex-col justify-between">
        <div className="w-full flex justify-between items-center py-3 px-4 border-gray-50 dark:border-darkBg border-y bg-lightBg dark:bg-darkBg">
          <div className="flex gap-3 items-center">
            <img
              src={avatarImg}
              alt="Avatar"
              className="h-10 w-10 rounded-full object-cover"
            />
            <h3 className="text-sm font-semibold text-lightText dark:text-darkText">
              {chatMeta?.name ?? "Loading..."}
            </h3>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button>
                <EllipsisVerticalIcon
                  width={25}
                  className="text-lightText dark:text-darkText cursor-pointer"
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-lightBg dark:bg-darkBg border-gray-50 dark:border-darkPrimary">
              <DropdownMenuItem>Option 1</DropdownMenuItem>
              <DropdownMenuItem>Option 2</DropdownMenuItem>
              <DropdownMenuItem>Option 3</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Sign Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div
          ref={containerRef}
          className="p-4 h-[80%] overflow-auto flex-1 flex flex-col relative"
        >
          {isFetchingNextPage && (
            <div className="flex justify-center py-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-lightPrimary border-t-transparent" />
            </div>
          )}

          {!hasNextPage && messages.length > 0 && (
            <p className="text-center text-xs text-gray-400 py-2">
              No more messages
            </p>
          )}

          {activeDateLabel && (
            <div className="sticky top-2 z-10 flex justify-center pointer-events-none">
              <span className="bg-gray-100 dark:bg-darkBg text-gray-500 dark:text-gray-400 text-xs font-medium px-3 py-1 rounded-full shadow-sm">
                {activeDateLabel}
              </span>
            </div>
          )}

          {groupedMessages.map((group) => (
            <div key={group.date}>
              <div
                data-date={group.date}
                className="flex items-center gap-2 my-3"
              >
                <hr className="flex-1 border-gray-200 dark:border-darkPrimary" />
                <span className="text-xs text-gray-400 dark:text-gray-500 font-medium px-2">
                  {group.date}
                </span>
                <hr className="flex-1 border-gray-200 dark:border-darkPrimary" />
              </div>
              {group.messages.map((message: Message, index: number) =>
                message?.sender?.id !== user?.id ? (
                  <div key={message.id ?? index} className="flex gap-2.5 mb-4">
                    <img
                      src={message?.sender?.image || avatarImg}
                      alt="Avatar"
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="grid">
                      <div className="w-max grid">
                        <div className="px-3.5 py-2 bg-lightBg dark:bg-darkBg rounded justify-start items-center gap-3 inline-flex">
                          <h5 className="text-lightText dark:text-darkText text-sm font-medium leading-snug">
                            {message?.content}
                          </h5>
                        </div>
                        <div className="justify-end items-center inline-flex mb-2.5">
                          <h6 className="text-gray-500 text-xs font-normal leading-4 py-1">
                            {formatMessageTime(message?.createdAt)}
                          </h6>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    key={message.id ?? index}
                    className="flex gap-2.5 justify-end mb-4"
                  >
                    <div>
                      <div className="grid mb-2">
                        <div className="px-3 py-2 bg-lightPrimary dark:bg-darkPrimary rounded">
                          <h2 className="text-darkText text-sm font-normal leading-snug">
                            {message?.content}
                          </h2>
                        </div>
                        <div className="justify-start items-center inline-flex">
                          <h3 className="text-gray-500 text-xs font-normal leading-4 py-1">
                            {formatMessageTime(message?.createdAt)}
                          </h3>
                        </div>
                      </div>
                    </div>
                    <img
                      src={message?.sender?.image || avatarImg}
                      alt="Avatar"
                      className="w-10 h-10 rounded-full"
                    />
                  </div>
                ),
              )}
            </div>
          ))}

          {unreadCount > 0 && (
            <button
              onClick={() => {
                setUnreadCount(0);
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
              }}
              className="sticky bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-lightPrimary dark:bg-darkPrimary text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg"
            >
              {unreadCount} new {unreadCount === 1 ? "message" : "messages"} ↓
            </button>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="w-[95%] mx-auto mb-2 px-4 py-2 rounded-3xl border border-gray-200 dark:border-darkPrimary items-center gap-2 inline-flex justify-between">
          <div className="flex items-center gap-2 flex-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
            >
              <g id="User Circle">
                <path
                  id="icon"
                  d="M6.05 17.6C6.05 15.3218 8.26619 13.475 11 13.475C13.7338 13.475 15.95 15.3218 15.95 17.6M13.475 8.525C13.475 9.89191 12.3669 11 11 11C9.6331 11 8.525 9.89191 8.525 8.525C8.525 7.1581 9.6331 6.05 11 6.05C12.3669 6.05 13.475 7.1581 13.475 8.525ZM19.25 11C19.25 15.5563 15.5563 19.25 11 19.25C6.44365 19.25 2.75 15.5563 2.75 11C2.75 6.44365 6.44365 2.75 11 2.75C15.5563 2.75 19.25 6.44365 19.25 11Z"
                  stroke="#4F46E5"
                  strokeWidth="1.6"
                />
              </g>
            </svg>
            <input
              className="grow shrink basis-0 text-lightText dark:text-darkText bg-lightBg dark:bg-darkBg border dark:border-darkPrimary rounded-md py-3 px-4 text-xs font-medium leading-4 focus:outline-none"
              placeholder="Type here..."
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className="flex items-center gap-2">
            <svg
              className="cursor-pointer"
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
            >
              <g id="Attach 01">
                <g id="Vector">
                  <path
                    d="M14.9332 7.79175L8.77551 14.323C8.23854 14.8925 7.36794 14.8926 6.83097 14.323C6.294 13.7535 6.294 12.83 6.83097 12.2605L12.9887 5.72925M12.3423 6.41676L13.6387 5.04176C14.7126 3.90267 16.4538 3.90267 17.5277 5.04176C18.6017 6.18085 18.6017 8.02767 17.5277 9.16676L16.2314 10.5418M16.8778 9.85425L10.72 16.3855C9.10912 18.0941 6.49732 18.0941 4.88641 16.3855C3.27549 14.6769 3.27549 11.9066 4.88641 10.198L11.0441 3.66675"
                    stroke="#9CA3AF"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
              </g>
            </svg>
            <button
              onClick={sendMessage}
              disabled={!newMsg.trim()}
              className="items-center flex px-3 py-2 bg-lightPrimary dark:bg-darkPrimary rounded-full shadow disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <g id="Send 01">
                  <path
                    id="icon"
                    d="M9.04071 6.959L6.54227 9.45744M6.89902 10.0724L7.03391 10.3054C8.31034 12.5102 8.94855 13.6125 9.80584 13.5252C10.6631 13.4379 11.0659 12.2295 11.8715 9.81261L13.0272 6.34566C13.7631 4.13794 14.1311 3.03408 13.5484 2.45139C12.9657 1.8687 11.8618 2.23666 9.65409 2.97257L6.18714 4.12822C3.77029 4.93383 2.56187 5.33664 2.47454 6.19392C2.38721 7.0512 3.48957 7.68941 5.69431 8.96584L5.92731 9.10074C6.23326 9.27786 6.38623 9.36643 6.50978 9.48998C6.63333 9.61352 6.72189 9.7665 6.89902 10.0724Z"
                    stroke="white"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </g>
              </svg>
              <h3 className="text-white text-xs font-semibold leading-4 px-2">
                Send
              </h3>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
