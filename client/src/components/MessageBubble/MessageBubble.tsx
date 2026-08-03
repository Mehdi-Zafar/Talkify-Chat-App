import avatarImg from "@/assets/avatar.webp";
import { Message } from "@/utils/contracts";
import { formatMessageTime } from "@/utils/helper";

interface MessageBubbleProps {
  message: Message;
  isSent: boolean;
}

export default function MessageBubble({ message, isSent }: MessageBubbleProps) {
  if (isSent) {
    return (
      <div className="flex gap-2.5 justify-end mb-4">
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
    );
  }

  return (
    <div className="flex gap-2.5 mb-4">
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
  );
}
