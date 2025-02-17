import {
  Button,
  Checkbox,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
} from "@material-tailwind/react";
import InputField from "../InputField/InputField";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
} from "@material-tailwind/react";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChatAPI, UsersAPI } from "../../api";
import { Chat, UserRelationType } from "../../utils/contracts";
import { useUserStore } from "../../zustand";
import maleAvatar from "../../assets/male-avatar.jpg";

const data = [
  {
    label: "Contacts",
    value: UserRelationType.CONTACT,
  },
  {
    label: "Other",
    value: UserRelationType.NON_CONTACT,
  },
];

const FormSchema = z.object({
  group_name: z.string().min(1, { message: "Group Name is required" }),
});

export default function NewGroupChatModal({ openModal, handleOpen }) {
  const [selectedMembers, setSelectedMembers] = useState([]);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(FormSchema) });
  const { user } = useUserStore();
  const [activeTab, setActiveTab] = useState(UserRelationType.CONTACT);
  const { data: users } = useQuery({
    queryKey: ["users", activeTab],
    queryFn: getUsers,
    enabled: openModal,
  });
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (data: Chat) => {
      return createGroupChat(data);
    },
  });

  async function getUsers() {
    try {
      const res = await UsersAPI.getChatUsers(user?.id, activeTab);
      return res.data;
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  async function createGroupChat(chatInfo: Chat) {
    try {
      const res = await ChatAPI.createGroupChat(chatInfo);
      return res.data;
    } catch (err) {
      console.error(err);
    }
  }

  function toggleMembers(user) {
    setSelectedMembers((members) =>
      members.find((member) => member?.id === user?.id)
        ? members.filter((member) => member?.id !== user?.id)
        : [...members, user]
    );
  }

  console.log(selectedMembers);

  function onSubmit(data) {
    const chatInfo = new Chat();
    chatInfo.creator_id = user?.id;
    chatInfo.name = data.group_name;
    chatInfo.members = [...selectedMembers?.map((user) => user?.id), user?.id];
    chatInfo.isGroupChat = true;
    mutateAsync(chatInfo);
  }
  return (
    <Dialog
      open={openModal}
      handler={handleOpen}
      size="md"
      className="px-2 relative bg-lightBg dark:bg-darkBg"
    >
      <DialogHeader className="text-lightText dark:text-darkText">
        New Group Chat
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogBody className="py-0">
          <div className="my-4">
            <InputField
              label="Group Name"
              placeholder="Enter Group Name"
              register={{ ...register("group_name") }}
              error={errors["group_name"]}
            />
            {selectedMembers?.length > 0 && (
              <div>
                <h3>Members</h3>
                <div className="flex items-center gap-4 flex-wrap">
                  {selectedMembers?.map((member) => (
                    <div className="flex items-center gap-2">
                      <img
                        src={member?.image}
                        className="w-6 h-6 rounded-full"
                      />
                      {member?.user_name}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-4 flex flex-col gap-4 max-h-[50vh]">
              <Tabs value={activeTab}>
                <TabsHeader
                  className="rounded-none border-b border-blue-gray-50 bg-transparent p-0"
                  indicatorProps={{
                    className:
                      "bg-transparent border-b-2 border-gray-900 shadow-none rounded-none",
                  }}
                >
                  {data.map(({ label, value }) => (
                    <Tab
                      key={value}
                      value={value}
                      onClick={() => setActiveTab(value)}
                      className={activeTab === value ? "text-gray-900" : ""}
                    >
                      {label}
                    </Tab>
                  ))}
                </TabsHeader>
                <TabsBody>
                  <div className="mt-4 flex flex-col gap-4 h-[40vh] overflow-y-auto">
                    {users?.length > 0 ? (
                      users?.map((user) => (
                        <label
                          htmlFor={user?.id}
                          className="flex w-full cursor-pointer justify-between items-center border border-gray-100 dark:border-gray-800 rounded-lg py-2 px-4"
                        >
                          <div className="flex items-center gap-2">
                            <img
                              className="w-10 h-10 rounded-full"
                              src={user?.image ? user?.image : maleAvatar}
                            />
                            <h3 className="font-medium text-lightText dark:text-darkText">
                              {user?.user_name}
                            </h3>
                          </div>
                          <Checkbox
                            id={user?.id}
                            ripple={false}
                            className="hover:before:opacity-0"
                            containerProps={{
                              className: "p-0",
                            }}
                            crossOrigin=""
                            onChange={() => toggleMembers(user)}
                          />
                        </label>
                      ))
                    ) : (
                      <div className="h-full flex justify-center items-center">
                        <h3 className="text-center">No Users Found!</h3>
                      </div>
                    )}
                  </div>
                </TabsBody>
              </Tabs>
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
              type="submit"
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
