import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import SearchInput from "../SearchInput/SearchInput";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { UsersAPI } from "../../api";
import maleAvatar from "../../assets/male-avatar.jpg";
import { useUserStore } from "../../zustand";
import { Chat, User, UserRelationType } from "@/utils/contracts";
import { ChangeEvent, useState } from "react";
import { twMerge } from "tailwind-merge";
import { useNavigate } from "@tanstack/react-router";
import { useDebounce } from "@/hooks/useDebounce";

export default function NewChatModal({ openModal, handleOpen }) {
  const { user } = useUserStore();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const search = useDebounce(searchKeyword, 500);
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
        search,
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
    navigate({ to: `/chat/new?userId=${selectedUser?.id}` });
    handleOpen();
  }

  return (
    <Dialog open={openModal} onOpenChange={handleOpen}>
      <DialogContent className="max-w-md bg-lightBg dark:bg-darkBg">
        <DialogHeader>
          <DialogTitle className="text-lightText dark:text-darkText">
            New Chat
          </DialogTitle>
        </DialogHeader>

        <form>
          <div className="flex flex-col gap-4">
            <SearchInput
              value={searchKeyword}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setSearchKeyword(e.target.value)
              }
            />
            <div className="flex flex-col gap-3 h-[50vh] overflow-y-auto">
              {isFetching ? (
                <div className="h-full flex justify-center items-center">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-lightPrimary border-t-transparent" />
                </div>
              ) : users?.length > 0 ? (
                users?.map((user) => (
                  <div
                    key={user?.id}
                    className={twMerge(
                      "flex items-center gap-2 border border-gray-100 dark:border-gray-800 rounded-lg py-2 px-4 cursor-pointer hover:opacity-80",
                      selectedUser?.id === user?.id &&
                        "bg-lightPrimary dark:bg-darkPrimary",
                    )}
                    onClick={() => setSelectedUser(user)}
                  >
                    <img
                      className="w-10 h-10 rounded-full"
                      src={user?.image ?? maleAvatar}
                    />
                    <h3
                      className={twMerge(
                        "font-medium text-lightText dark:text-darkText",
                        selectedUser?.id === user?.id && "text-darkText",
                      )}
                    >
                      {user?.user_name}
                    </h3>
                  </div>
                ))
              ) : (
                <h3 className="h-full flex items-center justify-center text-sm text-gray-400">
                  No Users Found!
                </h3>
              )}
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="ghost" type="button" onClick={handleOpen}>
              Cancel
            </Button>
            <Button disabled={!selectedUser?.id} onClick={handleNewChat}>
              Confirm
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
