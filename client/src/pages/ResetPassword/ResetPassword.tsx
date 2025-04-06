import { LockClosedIcon } from "@heroicons/react/24/outline";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ButtonComp, InputField } from "../../components";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { UsersAPI } from "../../api";
import { ResetPasswordPayload } from "../../utils/contracts";
import { useEffect, useState } from "react";

const FormSchema = z
  .object({
    email: z.string().email().min(1, "Email is required!"),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .regex(/[0-9]/, { message: "Password must include at least one number" })
      .regex(/[^A-Za-z0-9]/, {
        message: "Password must include at least one special character",
      })
      .nonempty({ message: "Password is required" }),
    confirm_password: z
      .string()
      .min(1, { message: "Confirm Password is required" }),
  })
  .refine((data) => data.password === data.confirm_password, {
    path: ["confirm_password"],
    message: "Passwords must match",
  });

export default function ResetPassword() {
  const { state } = useLocation();
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: { email: state?.email, password: "", confirm_password: "" },
  });
  const navigate = useNavigate();
  const [userData, setUserData] = useState(state);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (data: ResetPasswordPayload) => {
      return UsersAPI.resetPassword(data);
    },
  });

  async function formSubmit(data) {
    try {
      const { email, password } = data;
      const res = await mutateAsync({ email, password });
      setTimeout(() => {
        navigate("/sign-in");
      }, 1000);
    } catch (err) {}
  }

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = ""; // Required for Chrome to show a warning
      setUserData(null);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  if (!userData) {
    return <Navigate to="/sign-in" />;
  }

  return (
    <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-darkBg h-full overflow-auto">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm flex flex-col items-center gap-4">
        <span className="bg-lightPrimary dark:bg-darkPrimary w-12 h-12 rounded-full flex justify-center">
          <LockClosedIcon width={24} stroke="white" />
        </span>
        <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-lightText dark:text-darkText uppercase">
          Reset Password
        </h2>
        <form
          onSubmit={handleSubmit(formSubmit)}
          className="w-full flex flex-col gap-2"
        >
          <InputField
            placeholder="Enter Email"
            containerClass="block w-full"
            label="Email"
            register={{ ...register("email") }}
            error={errors["email"]}
            disabled
          />
          <InputField
            placeholder="Enter Password"
            containerClass="block w-full"
            type="password"
            label="Password"
            register={{ ...register("password") }}
            error={errors["password"]}
          />
          <InputField
            placeholder="Enter Password"
            containerClass="block w-full"
            type="password"
            label="Confirm Password"
            register={{ ...register("confirm_password") }}
            error={errors["confirm_password"]}
          />
          <ButtonComp label="Submit" className="mt-4" loading={isPending} />
        </form>
        <Link
          to="/sign-in"
          className="text-indigo-600 text-sm underline font-medium"
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}
