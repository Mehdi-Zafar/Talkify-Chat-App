import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { Link } from "@tanstack/react-router";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputField } from "../../components";
import logoImg from "../../assets/logo.webp";
import { AuthCredentials } from "../../utils/contracts";
import { useAuthStore } from "../../zustand";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_public/sign-in")({
  component: SignIn,
});

const FormSchema = z.object({
  email: z.string().min(1, { message: "Email is required" }).email(),
  password: z.string().min(1, { message: "Password is required" }),
});

function SignIn() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(FormSchema) });
  const { login } = useAuthStore();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (data: AuthCredentials) => {
      return login(data);
    },
  });

  async function formSubmit(data: AuthCredentials) {
    await mutateAsync(data);
    reset();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-darkBg px-4">
      <div className="w-full max-w-md bg-white dark:bg-darkPrimary rounded-xl shadow-md border border-gray-100 dark:border-darkPrimary px-8 py-10">
        <div className="flex flex-col items-center gap-3 mb-8">
          <img src={logoImg} alt="Talkify" className="w-20 object-contain" />
          <h2 className="text-center text-2xl font-bold tracking-tight text-lightText dark:text-darkText uppercase">
            Sign in
          </h2>
        </div>

        <form onSubmit={handleSubmit(formSubmit)} className="space-y-3">
          <InputField
            label="Email"
            name="email"
            placeholder="Enter Email"
            register={{ ...register("email") }}
            error={errors["email"]}
          />
          <InputField
            label="Password"
            name="password"
            type="password"
            placeholder="Enter Password"
            register={{ ...register("password") }}
            error={errors["password"]}
          />

          <div className="pt-1">
            <Button className="w-full" type="submit" loading={isPending}>
              Sign In
            </Button>
          </div>
        </form>

        <div className="text-sm mt-3 flex justify-end">
          <Link
            to="/forgot-password"
            className="font-semibold text-indigo-600 hover:text-indigo-500"
          >
            Forgot password?
          </Link>
        </div>

        <p className="mt-8 text-center text-sm text-gray-500">
          Not a member?{" "}
          <Link
            to="/sign-up"
            className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
          >
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
}
