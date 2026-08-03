import { useEffect } from "react";
import { Socket } from "socket.io-client";
import { Message, SocketEvent } from "@/utils/contracts";

interface UseChatSocketParams {
  socket: Socket | null;
  chatId: number;
  containerRef: React.RefObject<HTMLDivElement>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
}

export function useChatSocket({
  socket,
  chatId,
  containerRef,
  setMessages,
  setUnreadCount,
}: UseChatSocketParams) {
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: Message) => {
      if (message.chat_id !== chatId) return;

      setMessages((prev) => [...prev, message]);

      requestAnimationFrame(() => {
        const container = containerRef.current;
        if (!container) return;

        const isNearBottom =
          container.scrollHeight -
            container.scrollTop -
            container.clientHeight <
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
  }, [socket, chatId, containerRef, setMessages, setUnreadCount]);
}
