import { twMerge } from "tailwind-merge";
import avatarImg from "@/assets/avatar.webp";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { lazy, useState } from "react";
import { useAuthStore, useUserStore } from "@/zustand";
import { useQuery } from "@tanstack/react-query";
import { ChatAPI } from "@/api";
import { Chat } from "@/utils/contracts";
import { formatMessageTime } from "@/utils/helper";
import { Button } from "../ui/button";
import { EllipsisVerticalIcon } from "lucide-react";
const NewGroupChatModal = lazy(
  () => import("../NewGroupChatModal/NewGroupChatModal"),
);
const NewChatModal = lazy(() => import("../NewChatModal/NewChatModal"));
const SearchInput = lazy(() => import("../SearchInput/SearchInput"));

export default function ChatListing() {
  const { id } = useParams({ strict: false });
  const navigate = useNavigate();
  const [openNewChat, setOpenNewChat] = useState(false);
  const [openNewGroupChat, setOpenNewGroupChat] = useState(false);
  const logout = useAuthStore((state) => state.logout);
  const user = useUserStore((state) => state.user);

  const { data: chats, isFetching: fetchingChats } = useQuery({
    queryKey: ["chats", user?.id],
    queryFn: getChats,
    enabled: !isNaN(Number(user?.id)),
  });

  async function getChats() {
    try {
      const chats = await ChatAPI.getChatsByUserId(user?.id);
      return chats;
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  function selectChat(chatId: number) {
    navigate({ to: `/chat/${chatId}` });
  }

  async function signOut() {
    await logout();
  }

  return (
    <>
      <div className="h-full flex flex-col py-2 border-r border-gray-50 dark:border-darkBg">
        <div className="px-4 py-2.5 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-lightText dark:text-darkText">
            Chats
          </h2>
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
              <DropdownMenuItem onClick={() => setOpenNewChat(true)}>
                New Chat
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setOpenNewGroupChat(true)}>
                New Group
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>Sign Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="w-full max-w-sm min-w-50 px-4">
          <SearchInput />
        </div>

        <div className="flex-1 overflow-auto py-4 px-4 space-y-4">
          {fetchingChats ? (
            <div className="h-full flex justify-center items-center">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-lightPrimary border-t-transparent" />
            </div>
          ) : chats?.length > 0 ? (
            chats?.map((chat: Chat) => (
              <div
                key={chat?.id}
                className={twMerge(
                  "py-3 px-4 bg-lightBg dark:bg-darkBg shadow-sm rounded-md flex justify-between cursor-pointer duration-500 text-lightText dark:text-darkText ease-in-out hover:bg-lightPrimary dark:hover:bg-darkPrimary hover:text-white",
                  id == chat?.id &&
                    "bg-lightPrimary dark:bg-darkPrimary text-white",
                )}
                onClick={() => selectChat(chat?.id)}
              >
                <div className="flex gap-3 items-center">
                  <img
                    src={avatarImg}
                    alt="Avatar"
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-sm font-semibold">{chat?.name}</h3>
                    <small className="text-[11px] line-clamp-1 opacity-80 font-medium">
                      {chat?.lastMessage?.content || "No messages yet!"}
                    </small>
                  </div>
                </div>
                <div className="flex flex-col shrink-0">
                  <small className="text-xs font-medium opacity-80">
                    {formatMessageTime(
                      chat?.lastMessage?.createdAt || chat?.updatedAt,
                    )}
                  </small>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <h2 className="text-lightText dark:text-darkText">
                No Chats to Display!
              </h2>
              <Button className="w-fit" onClick={() => setOpenNewChat(true)}>
                Add New Chat
              </Button>
            </div>
          )}
        </div>
      </div>
      {openNewChat && (
        <NewChatModal
          openModal={openNewChat}
          handleOpen={() => setOpenNewChat((prev) => !prev)}
        />
      )}
      {openNewGroupChat && (
        <NewGroupChatModal
          openModal={openNewGroupChat}
          handleOpen={() => setOpenNewGroupChat((prev) => !prev)}
        />
      )}
    </>
  );
}
