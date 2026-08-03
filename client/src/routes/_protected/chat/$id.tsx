import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChatAPI } from "@/api";
import { useSocketStore, useUserStore, useChatStore } from "@/zustand";
import { Message, SocketEvent } from "@/utils/contracts";
import { groupMessagesByDate } from "@/utils/helper";
import {
  updateLastMessageInCache,
  clearUnreadInCache,
} from "@/lib/queryClient";
import { useChatMessages } from "@/hooks/useChatMessages";
import { useChatScroll } from "@/hooks/useChatScroll";
import { useChatSocket } from "@/hooks/useChatSocket";
import { ChatHeader, MessageInput, MessageList } from "@/components";

export const Route = createFileRoute("/_protected/chat/$id")({
  component: ChatDisplay,
});

function ChatDisplay() {
  const { id } = Route.useParams();
  const chatId = Number(id);

  const user = useUserStore((state) => state.user);
  const socketEmit = useSocketStore((state) => state.emit);
  const socket = useSocketStore((state) => state.socket);

  const [newMsg, setNewMsg] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  const {
    messages,
    setMessages,
    isFirstLoad,
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    chatMeta,
  } = useChatMessages(chatId);

  const { containerRef, messagesEndRef, activeDateLabel } = useChatScroll({
    messages,
    isFirstLoad,
    data,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    unreadCount,
    setMessages,
    setUnreadCount,
  });

  useChatSocket({ socket, chatId, containerRef, setMessages, setUnreadCount });

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

  function sendMessage() {
    if (!chatId || !user || !newMsg.trim()) return;

    const message = new Message();
    message.chat_id = chatId;
    message.sender = { ...message.sender, id: user.id, image: user.image };
    message.content = newMsg;
    message.createdAt = new Date().toISOString();

    setMessages((prev) => [...prev, message]);
    updateLastMessageInCache(user.id, message, user.id);
    socketEmit(SocketEvent.SEND_MSG, message);
    setNewMsg("");
    setUnreadCount(0);
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });
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
        <ChatHeader chatMeta={chatMeta} />
        <MessageList
          containerRef={containerRef}
          messagesEndRef={messagesEndRef}
          groupedMessages={groupedMessages}
          activeDateLabel={activeDateLabel}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage}
          messages={messages}
          userId={user?.id}
          unreadCount={unreadCount}
          setUnreadCount={setUnreadCount}
          onScrollToBottom={() => {
            setUnreadCount(0);
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
          }}
        />
        <MessageInput
          newMsg={newMsg}
          setNewMsg={setNewMsg}
          sendMessage={sendMessage}
        />
      </div>
    </div>
  );
}
