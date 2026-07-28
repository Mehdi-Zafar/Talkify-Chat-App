import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import InputField from "../InputField/InputField";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChatAPI, UsersAPI } from "../../api";
import { Chat, UserRelationType } from "../../utils/contracts";
import { useUserStore } from "../../zustand";
import maleAvatar from "../../assets/male-avatar.jpg";

const data = [
  { label: "Contacts", value: UserRelationType.CONTACT },
  { label: "Other", value: UserRelationType.NON_CONTACT },
];

const FormSchema = z.object({
  group_name: z.string().min(1, { message: "Group Name is required" }),
});

export default function NewGroupChatModal({ openModal, handleOpen }) {
  const [selectedMembers, setSelectedMembers] = useState([]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(FormSchema) });
  const { user } = useUserStore();
  const [activeTab, setActiveTab] = useState(UserRelationType.CONTACT);

  const { data: users } = useQuery({
    queryKey: ["users", activeTab],
    queryFn: getUsers,
    enabled: openModal,
  });

  const { mutateAsync } = useMutation({
    mutationFn: (data: Chat) => createGroupChat(data),
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
    setSelectedMembers((members) => {
      const isUserPresent = members.some((member) => member?.id === user?.id);
      if (isUserPresent) {
        return members.filter((member) => member?.id !== user?.id);
      }
      return [...members, user];
    });
  }

  function onSubmit(data) {
    const chatInfo = new Chat();
    chatInfo.creator_id = user?.id;
    chatInfo.name = data.group_name;
    chatInfo.members = [...selectedMembers?.map((u) => u?.id), user?.id];
    chatInfo.isGroupChat = true;
    mutateAsync(chatInfo);
  }

  return (
    <Dialog open={openModal} onOpenChange={handleOpen}>
      <DialogContent className=" bg-lightBg dark:bg-darkBg">
        <DialogHeader>
          <DialogTitle className="text-lightText dark:text-darkText">
            New Group Chat
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="my-4">
            <InputField
              label="Group Name"
              placeholder="Enter Group Name"
              register={{ ...register("group_name") }}
              error={errors["group_name"]}
            />

            {selectedMembers?.length > 0 && (
              <div className="mt-2">
                <h3 className="block text-sm font-semibold leading-6 text-lightText dark:text-darkText">
                  Members
                </h3>
                <div className="flex items-center gap-4 flex-wrap mt-2">
                  {selectedMembers?.map((member) => (
                    <div key={member?.id} className="flex items-center gap-2">
                      <img
                        src={member?.image ?? maleAvatar}
                        className="w-6 h-6 rounded-full"
                      />
                      {member?.user_name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4">
              <Tabs
                value={activeTab}
                onValueChange={(value) =>
                  setActiveTab(value as UserRelationType)
                }
              >
                <TabsList
                  variant="line"
                  className="w-full justify-start rounded-none border-b border-gray-200 dark:border-gray-900 bg-transparent p-0 h-auto gap-0"
                >
                  {data.map(({ label, value }) => (
                    <TabsTrigger
                      key={value}
                      value={value}
                      className="rounded-none px-4 py-2 border-b-2 border-transparent bg-transparent shadow-none text-lightText dark:text-darkText data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                    >
                      {label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value={activeTab}>
                  <div className="mt-4 flex flex-col gap-4 max-h-[35vh] overflow-y-auto">
                    {users?.length > 0 ? (
                      users?.map((user) => (
                        <label
                          key={user?.id}
                          htmlFor={user?.id}
                          className="flex w-full cursor-pointer justify-between items-center border border-gray-100 dark:border-gray-800 rounded-lg py-2 px-4"
                        >
                          <div className="flex items-center gap-2">
                            <img
                              className="w-10 h-10 rounded-full"
                              src={user?.image ?? maleAvatar}
                            />
                            <h3 className="font-medium text-lightText dark:text-darkText">
                              {user?.user_name}
                            </h3>
                          </div>
                          <Checkbox
                            id={user?.id}
                            onCheckedChange={() => toggleMembers(user)}
                            checked={
                              !!selectedMembers?.find(
                                (member) => member?.id === user?.id,
                              )
                            }
                          />
                        </label>
                      ))
                    ) : (
                      <div className="h-full flex justify-center items-center">
                        <h3 className="text-center">No Users Found!</h3>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" type="button" onClick={handleOpen}>
              Cancel
            </Button>
            <Button type="submit">Confirm</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
