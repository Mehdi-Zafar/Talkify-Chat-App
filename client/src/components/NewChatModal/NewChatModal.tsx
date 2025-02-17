import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
} from "@material-tailwind/react";
import SearchInput from "../SearchInput/SearchInput";
import { useQuery } from "@tanstack/react-query";
import { UsersAPI } from "../../api";
import maleAvatar from "../../assets/male-avatar.jpg";
import { useUserStore } from "../../zustand";
import { UserRelationType } from "../../utils/contracts";

export default function NewChatModal({ openModal, handleOpen }) {
  const { user } = useUserStore();
  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
    enabled: openModal,
  });

  async function getUsers() {
    try {
      const res = await UsersAPI.getChatUsers(
        user?.id,
        UserRelationType.NON_CONTACT
      );
      return res.data;
    } catch (err) {
      console.error(err);
      return [];
    }
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
            <SearchInput />
            <div className="mt-4 flex flex-col gap-4 h-[50vh] overflow-y-auto">
              {users?.map((user) => (
                <div className="flex items-center gap-2 border border-gray-100 dark:border-gray-800 rounded-lg py-2 px-4">
                  <img
                    className="w-10 h-10 rounded-full"
                    src={user?.image ? user?.image : maleAvatar}
                  />
                  <h3 className="font-medium text-lightText dark:text-darkText">
                    {user?.user_name}
                  </h3>
                </div>
              ))}
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
              //   onClick={() => {
              //     formRef ? submitForm() : {};
              //   }}
            >
              <span>Confirm</span>
            </Button>
          </>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
