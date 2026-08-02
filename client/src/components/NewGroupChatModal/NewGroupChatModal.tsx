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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChatAPI, UsersAPI } from "../../api";
import { UserRelationType } from "../../utils/contracts";
import { useUserStore } from "../../zustand";
import maleAvatar from "../../assets/male-avatar.jpg";

const tabs = [
  { label: "Contacts", value: UserRelationType.CONTACT },
  { label: "Other", value: UserRelationType.NON_CONTACT },
];

const FormSchema = z.object({
  group_name: z.string().min(1, { message: "Group Name is required" }),
});

type FormValues = z.infer<typeof FormSchema>;

interface User {
  id: number;
  user_name: string;
  image: string | null;
}

interface Props {
  openModal: boolean;
  handleOpen: () => void;
}

export default function NewGroupChatModal({ openModal, handleOpen }: Props) {
  const [selectedMembers, setSelectedMembers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<UserRelationType>(
    UserRelationType.CONTACT,
  );

  const user = useUserStore((state) => state.user);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(FormSchema) });

  const { data: users } = useQuery({
    queryKey: ["users", activeTab],
    queryFn: () => UsersAPI.getChatUsers(user?.id, activeTab),
    enabled: openModal,
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (payload: {
      name: string;
      isGroupChat: boolean;
      members: number[];
    }) => ChatAPI.createGroupChat(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats", user?.id] });
      reset();
      setSelectedMembers([]);
      handleOpen();
    },
  });

  function toggleMember(selectedUser: User) {
    setSelectedMembers((prev) => {
      const exists = prev.some((m) => m.id === selectedUser.id);
      return exists
        ? prev.filter((m) => m.id !== selectedUser.id)
        : [...prev, selectedUser];
    });
  }

  function onSubmit(data: FormValues) {
    mutateAsync({
      name: data.group_name,
      isGroupChat: true,
      members: selectedMembers.map((m) => m.id),
    });
  }

  return (
    <Dialog open={openModal} onOpenChange={handleOpen}>
      <DialogContent className="bg-lightBg dark:bg-darkBg">
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

            {selectedMembers.length > 0 && (
              <div className="mt-2">
                <h3 className="block text-sm font-semibold leading-6 text-lightText dark:text-darkText">
                  Members
                </h3>
                <div className="flex items-center gap-4 flex-wrap mt-2">
                  {selectedMembers.map((member) => (
                    <div key={member.id} className="flex items-center gap-2">
                      <img
                        src={member.image ?? maleAvatar}
                        className="w-6 h-6 rounded-full"
                        alt={member.user_name}
                      />
                      <span className="text-sm text-lightText dark:text-darkText">
                        {member.user_name}
                      </span>
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
                  {tabs.map(({ label, value }) => (
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
                      users.map((u) => (
                        <label
                          key={u.id}
                          htmlFor={String(u.id)}
                          className="flex w-full cursor-pointer justify-between items-center border border-gray-100 dark:border-gray-800 rounded-lg py-2 px-4"
                        >
                          <div className="flex items-center gap-2">
                            <img
                              className="w-10 h-10 rounded-full"
                              src={u.image ?? maleAvatar}
                              alt={u.user_name}
                            />
                            <h3 className="font-medium text-lightText dark:text-darkText">
                              {u.user_name}
                            </h3>
                          </div>
                          <Checkbox
                            id={String(u.id)}
                            onCheckedChange={() => toggleMember(u)}
                            checked={selectedMembers.some((m) => m.id === u.id)}
                          />
                        </label>
                      ))
                    ) : (
                      <div className="h-full flex justify-center items-center">
                        <h3 className="text-center text-lightText dark:text-darkText">
                          No Users Found!
                        </h3>
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
            <Button
              type="submit"
              loading={isPending}
              disabled={selectedMembers.length === 0}
            >
              Confirm
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
