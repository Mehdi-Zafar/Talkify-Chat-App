import maleAvatar from "../../assets/male-avatar.jpg";
import femaleAvatar from "../../assets/female-avatar.jpg";
import { ButtonComp, InputField, TextareaField } from "../../components";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { useUserStore } from "../../zustand";
import { useEffect } from "react";

const MAX_FILE_SIZE = 5000000;

function checkFileType(file: File) {
  if (file?.name) {
    const fileType = file.name.split(".").pop();
    if (fileType === "png" || fileType === "jpg") return true;
  }
  return false;
}

const FormSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  about: z.string().max(50, { message: "Max 50 characters allowed" }),
  image: z
    .any()
    .refine((file) => file.size < MAX_FILE_SIZE, "Max size is 5MB.")
    .refine(
      (file) => checkFileType(file),
      "Only .png, .jpg formats are supported."
    ),
});

export default function Profile() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm({ resolver: zodResolver(FormSchema) });
  const { user } = useUserStore();

  useEffect(() => {
    setValue("username", user?.user_name);
  }, [user?.id]);

  function onSubmit(data) {
    console.log(data);
  }
  return (
    <div className="py-6 px-6">
      <h2 className="text-2xl font-semibold text-lightText dark:text-darkText">
        Profile
      </h2>
      <div className="mt-8">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="relative">
            <div className="mx-auto w-40 h-40 rounded-full overflow-clip">
              <img
                src={maleAvatar}
                alt=""
                className="w-full h-full object-cover"
              />
              <div className="absolute -top-2 -right-5">
                <input
                  type="file"
                  {...register("image")}
                  hidden
                  id="image-input"
                />
                <label htmlFor="image-input">
                  <PencilSquareIcon width={20} stroke="white" />
                </label>
              </div>
              {errors["image"]?.message.toString()}
            </div>
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
