import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { twMerge } from "tailwind-merge";
import avatarImg from "../../../../assets/avatar.png";
import { useNavigate, useParams } from "react-router-dom";
import {
  ButtonComp,
  NewChatModal,
  NewGroupChatModal,
  SearchInput,
} from "../../../../components";
import {
  Menu,
  MenuHandler,
  MenuItem,
  MenuList,
} from "@material-tailwind/react";
import { useState } from "react";
import { useAuthStore, useUserStore } from "../../../../zustand";
import { useQuery } from "@tanstack/react-query";
import { ChatAPI, UsersAPI } from "../../../../api";
import { UserRelationType } from "../../../../utils/contracts";

// const chats = [1, 2, 3, 4, 5, 6, 7, 8];
// const chats = [];

export default function ChatListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [openNewChat, setOpenNewChat] = useState(false);
  const [openNewGroupChat, setOpenNewGroupChat] = useState(false);
  const { logout } = useAuthStore();
  const { user } = useUserStore();
  const { data: users } = useQuery({
    queryKey: ["chats", user?.id],
    queryFn: getChats,
  });

  async function getChats() {
    try {
      const res = await ChatAPI.getChatsByUserId(user?.id);
      return res.data;
    } catch (err) {
      console.error(err);
      return [];
    }
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
          <Menu>
            <MenuHandler>
              <EllipsisVerticalIcon
                width={25}
                className="text-lightText dark:text-darkText cursor-pointer"
              />
            </MenuHandler>
            <MenuList className="bg-lightBg dark:bg-darkBg border-gray-50 dark:border-darkPrimary">
              <MenuItem
                className="flex items-center gap-2"
                onClick={() => setOpenNewChat(true)}
              >
                New Chat
              </MenuItem>
              <MenuItem
                className="flex items-center gap-2"
                onClick={() => setOpenNewGroupChat(true)}
              >
                New Group
              </MenuItem>
              <hr className="my-2 border-blue-gray-50" />
              <MenuItem className="flex items-center gap-2" onClick={signOut}>
                Sign Out
              </MenuItem>
            </MenuList>
          </Menu>
        </div>
        <div className="w-full max-w-sm min-w-[200px] px-4">
          <SearchInput />
        </div>
        <div></div>
        <div className="flex-1 overflow-auto py-4 px-4 space-y-4">
          {users?.length > 0 ? (
            users?.map((chat) => (
              <div
                className={twMerge(
                  `py-3 px-4 bg-lightBg dark:bg-darkBg shadow-sm rounded-md flex justify-between cursor-pointer duration-500 text-lightText dark:text-darkText ease-in-out hover:bg-lightPrimary dark:hover:bg-darkPrimary hover:text-white`,
                  id == chat.toString() &&
                    "bg-lightPrimary dark:bg-darkPrimary text-white"
                )}
                onClick={() => navigate(`/chat/${chat?.id}`)}
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
                      Message Content dasdasdasdasdsaddas
                    </small>
                  </div>
                </div>
                <div className="flex flex-col shrink-0">
                  <small className="text-xs font-medium opacity-80">
                    07:00 pm
                  </small>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <h2 className="text-lightText dark:text-darkText">
                No Chats to Display!
              </h2>
              <ButtonComp
                label="Add New Chat"
                className="w-fit"
                onClick={() => setOpenNewChat(true)}
              />
            </div>
          )}
        </div>
      </div>
      <NewChatModal
        openModal={openNewChat}
        handleOpen={() => setOpenNewChat((prev) => !prev)}
      />
      <NewGroupChatModal
        openModal={openNewGroupChat}
        handleOpen={() => setOpenNewGroupChat((prev) => !prev)}
      />
    </>
  );
}
