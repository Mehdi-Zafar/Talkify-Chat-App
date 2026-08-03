import { createFileRoute } from "@tanstack/react-router";
import maleAvatar from "../../assets/male-avatar.jpg";
import { InputField, TextareaField } from "../../components";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useUserStore } from "../../zustand";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { UsersAPI } from "../../api";
import { showToast } from "../../utils/helper";
import { UploadIcon, XIcon } from "lucide-react";

export const Route = createFileRoute("/_protected/profile")({
  component: Profile,
});

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const checkFileType = (file: File | undefined) => {
  if (!file) return true;
  const allowedExtensions = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
  ];
  return allowedExtensions.includes(file.type);
};

const FormSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  about: z.string().max(50, { message: "Max 50 characters allowed" }),
  image: z
    .instanceof(File)
    .optional()
    .refine((file) => !file || checkFileType(file), {
      message: "Only .png, .jpg, .webp formats are supported.",
    })
    .refine((file) => !file || file.size < MAX_FILE_SIZE, {
      message: "Max size is 5MB.",
    }),
});

function Profile() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    trigger,
  } = useForm({ resolver: zodResolver(FormSchema) });
  const { user } = useUserStore();
  const [preview, setPreview] = useState("");

  useEffect(() => {
    setValue("username", user?.user_name);
  }, [user?.id]);

  useEffect(() => {
    if (preview) trigger("image");
  }, [preview]);

  async function onSubmit(data) {
    try {
      // await UsersAPI.updateUserData(data, user?.id);
      if (data.image instanceof File) {
        const formData = new FormData();
        formData.append("image", data.image);
        await UsersAPI.updateUserAvatar(formData, user?.id);
      }
      showToast("Profile updated successfully", "success");
    } catch (err) {
      showToast("Failed to update profile", "error");
    }
  }

  return (
    <div className="py-6 px-6">
      <h2 className="text-2xl font-semibold text-lightText dark:text-darkText">
        Profile
      </h2>
      <div className="mt-8">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="relative">
            <div className="w-fit mx-auto relative flex justify-center">
              <img
                src={preview || user?.image || maleAvatar}
                alt=""
                className="w-40 h-40 object-cover rounded-full shadow-md"
              />
              {getValues("image") && (
                <div className="absolute -top-2 -left-5">
                  <Button
                    size="icon"
                    type="button"
                    className="w-8 h-8 bg-lightPrimary dark:bg-darkPrimary rounded-md"
                    onClick={() => {
                      setValue("image", null);
                      setPreview("");
                    }}
                  >
                    <XIcon width={18} className="text-darkText" />
                  </Button>
                </div>
              )}
              <div className="absolute -top-2 -right-5">
                <label
                  htmlFor="image-input"
                  className="cursor-pointer bg-lightPrimary dark:bg-darkPrimary py-1.5 px-1.5 block rounded-md"
                >
                  <UploadIcon width={20} className="text-darkText" />
                </label>
                <input
                  type="file"
                  onChange={(event) => {
                    setValue("image", event.target.files[0]);
                    setPreview(URL.createObjectURL(event.target.files[0]));
                  }}
                  accept="image/png, image/jpeg, image/webp"
                  hidden
                  id="image-input"
                />
              </div>
            </div>
            <h4 className="text-center mt-4 text-sm text-red-500 font-medium">
              {errors["image"]?.message?.toString()}
            </h4>
          </div>

          <div className="w-1/2 flex flex-col gap-4 mt-4 mx-auto">
            <InputField
              label="Username"
              placeholder="Enter Username"
              register={{ ...register("username") }}
              error={errors["username"]}
            />
            <TextareaField
              label="About"
              placeholder="Enter About"
              register={{ ...register("about") }}
              error={errors["about"]}
            />
          </div>
          <Button className="mt-6 w-32 py-2 mx-auto block">Update</Button>
        </form>
      </div>
    </div>
  );
}
