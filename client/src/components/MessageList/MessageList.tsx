import { Message } from "@/utils/contracts";
import MessageBubble from "../MessageBubble/MessageBubble";

interface GroupedMessages {
  date: string;
  messages: Message[];
}

interface MessageListProps {
  containerRef: React.RefObject<HTMLDivElement>;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  groupedMessages: GroupedMessages[];
  activeDateLabel: string;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  messages: Message[];
  userId: number | undefined;
  unreadCount: number;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
  onScrollToBottom: () => void;
}

export default function MessageList({
  containerRef,
  messagesEndRef,
  groupedMessages,
  activeDateLabel,
  isFetchingNextPage,
  hasNextPage,
  messages,
  userId,
  unreadCount,
  onScrollToBottom,
}: MessageListProps) {
  return (
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
          {/* Date divider */}
          <div data-date={group.date} className="flex items-center gap-2 my-3">
            <hr className="flex-1 border-gray-200 dark:border-darkPrimary" />
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium px-2">
              {group.date}
            </span>
            <hr className="flex-1 border-gray-200 dark:border-darkPrimary" />
          </div>

          {group.messages.map((message: Message, index: number) => (
            <MessageBubble
              key={message.id ?? index}
              message={message}
              isSent={message?.sender?.id === userId}
            />
          ))}
        </div>
      ))}

      {unreadCount > 0 && (
        <button
          onClick={onScrollToBottom}
          className="sticky bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-lightPrimary dark:bg-darkPrimary text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg"
        >
          {unreadCount} new {unreadCount === 1 ? "message" : "messages"} ↓
        </button>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
