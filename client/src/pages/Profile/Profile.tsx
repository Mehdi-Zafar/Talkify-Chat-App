import maleAvatar from "../../assets/male-avatar.jpg";
import femaleAvatar from "../../assets/female-avatar.jpg";
import { ButtonComp, InputField, TextareaField } from "../../components";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  ArrowUpTrayIcon,
  PencilSquareIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useUserStore } from "../../zustand";
import { useEffect, useState } from "react";
import {
  IconButton,
  Menu,
  MenuHandler,
  MenuItem,
  MenuList,
} from "@material-tailwind/react";
import { UsersAPI } from "../../api";
import { showToast } from "../../utils/helper";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

const checkFileType = (file: File | undefined) => {
  if (!file) return true; // Skip if no file is provided (optional)
  const allowedExtensions = ["image/png", "image/jpeg", "image/jpg"];
  return allowedExtensions.includes(file.type);
};

const FormSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  about: z.string().max(50, { message: "Max 50 characters allowed" }),
  image: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => !file || checkFileType(file), // Check type only if file is provided
      { message: "Only .png, .jpg formats are supported." }
    )
    .refine(
      (file) => !file || file.size < MAX_FILE_SIZE, // Check size only if file is provided
      { message: "Max size is 5MB." }
    ),
});

export default function Profile() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    getValues,
    trigger,
  } = useForm({ resolver: zodResolver(FormSchema) });
  const { user } = useUserStore();
  const [preview, setPreview] = useState("");

  useEffect(() => {
    console.log(user);
    setValue("username", user?.user_name);
  }, [user?.id]);

  useEffect(() => {
    if (preview) {
      trigger("image");
    }
  }, [preview]);

  async function onSubmit(data) {
    try {
      const res = await UsersAPI.updateUserData(data, user?.id);
    } catch (err) {}
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
                src={preview ? preview : user?.image ? user?.image : maleAvatar}
                alt=""
                className="w-40 h-40 object-cover rounded-full shadow-md"
              />
              {getValues("image") ? (
                <div className="absolute -top-2 -left-5">
                  <IconButton
                    className="!w-8 !h-8 cursor-pointer bg-lightPrimary dark:bg-darkPrimary p-0 block rounded-md"
                    onClick={() => {
                      setValue("image", null);
                      setPreview("");
                    }}
                  >
                    <XMarkIcon width={18} className="text-darkText" />
                  </IconButton>
                </div>
              ) : null}
              <div className="absolute -top-2 -right-5">
                <label
                  htmlFor="image-input"
                  className="cursor-pointer bg-lightPrimary dark:bg-darkPrimary py-1.5 px-1.5 block rounded-md"
                >
                  <ArrowUpTrayIcon width={20} className="text-darkText" />
                </label>
                <input
                  type="file"
                  onChange={(event) => {
                    console.log(event.target.files);
                    setValue("image", event.target.files[0]);
                    setPreview(URL.createObjectURL(event.target.files[0]));
                  }}
                  hidden
                  id="image-input"
                />
              </div>
            </div>
            <h4 className="text-center mt-4 text-sm text-red-500 font-medium">
              {errors["image"]?.message.toString()}
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
          <ButtonComp label="Update" className="mt-6 w-32 py-2 mx-auto block" />
        </form>
      </div>
    </div>
  );
}
