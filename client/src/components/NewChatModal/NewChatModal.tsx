import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Spinner,
} from "@material-tailwind/react";
import SearchInput from "../SearchInput/SearchInput";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { UsersAPI } from "../../api";
import maleAvatar from "../../assets/male-avatar.jpg";
import { useUserStore } from "../../zustand";
import { Chat, User, UserRelationType } from "@/utils/contracts";
import { ChangeEvent, useState } from "react";
import { twMerge } from "tailwind-merge";
import { useDebounce } from "use-debounce";
import { useNavigate } from "react-router-dom";

export default function NewChatModal({ openModal, handleOpen }) {
  const { user } = useUserStore();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [search] = useDebounce(searchKeyword, 500);
  const { data: users, isFetching } = useQuery({
    queryKey: ["users", search],
    queryFn: getUsers,
    enabled: openModal,
  });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function getUsers() {
    try {
      const res = await UsersAPI.getChatUsers(
        user?.id,
        UserRelationType.NON_CONTACT,
        search
      );
      return res.data;
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  function handleNewChat() {
    const newChat = new Chat();
    newChat.members = [user?.id, selectedUser?.id];
    newChat.creator_id = user?.id;
    newChat.isGroupChat = false;
    newChat.name = selectedUser?.user_name;
    queryClient.setQueryData(["chats", user?.id], (oldChatsData: any) => {
      if (!oldChatsData) return oldChatsData;

      return [newChat, ...oldChatsData];
    });
    navigate(`/chat/new?userId=${selectedUser?.id}`);
    handleOpen();
  }

  return (
    <Dialog
      open={openModal}
      handler={handleOpen}
      size="md"
      className="px-2 relative bg-lightBg dark:bg-darkBg"
    >
      <DialogHeader className="text-lightText dark:text-darkText">
        New Chat
      </DialogHeader>
      <form>
        <DialogBody className="py-0">
          <div className="my-4">
            <SearchInput
              value={searchKeyword}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setSearchKeyword(e.target.value)
              }
            />
            <div className="mt-4 flex flex-col gap-4 h-[50vh] overflow-y-auto">
              {isFetching ? (
                <div className="h-full flex justify-center items-center">
                  <Spinner color="blue" />
                </div>
              ) : users?.length > 0 ? (
                users?.map((user) => (
                  <div
                    className={twMerge(
                      `flex items-center gap-2 border border-gray-100 dark:border-gray-800 rounded-lg py-2 px-4 cursor-pointer hover:opacity-80`,
                      selectedUser?.id === user?.id &&
                        "bg-lightPrimary dark:bg-darkPrimary"
                    )}
                    onClick={() => setSelectedUser(user)}
                  >
                    <img
                      className="w-10 h-10 rounded-full"
                      src={user?.image ? user?.image : maleAvatar}
                    />
                    <h3
                      className={twMerge(
                        `font-medium text-lightText dark:text-darkText`,
                        selectedUser?.id === user?.id && "text-darkText"
                      )}
                    >
                      {user?.user_name}
                    </h3>
                  </div>
                ))
              ) : (
                <h3 className="h-full flex items-center justify-center">
                  No Users Found!
                </h3>
              )}
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <>
            <Button
              variant="text"
              color="blue"
              type="button"
              onClick={handleOpen}
              className="mr-1"
            >
              <span>Cancel</span>
            </Button>
            <Button
              variant="gradient"
              color="blue"
              disabled={!selectedUser?.id}
              onClick={handleNewChat}
            >
              <span>Confirm</span>
            </Button>
          </>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
