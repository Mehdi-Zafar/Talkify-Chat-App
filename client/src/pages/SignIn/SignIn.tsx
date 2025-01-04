import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ButtonComp, InputField } from "../../components";
import signInImg from "../../assets/sign-in.jpg";
import { LockClosedIcon } from "@heroicons/react/24/outline";
import { showToast } from "../../utils/helper";

const FormSchema = z.object({
  email: z.string().min(1, { message: "Email is required" }).email(),
  password: z.string().min(1, { message: "Password is required" }),
});

export default function SignIn() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(FormSchema) });

  function formSubmit(data: any) {
    console.log(data);
    showToast("Sign In Successful!");
    reset();
  }

  return (
    <div className="h-screen py-8 flex justify-center">
      <div className="flex h-full w-11/12 rounded-xl overflow-clip justify-center shadow-md border border-gray-50 dark:border-darkPrimary">
        <div className="w-3/5">
          <img
            src={signInImg}
            alt="Sign In Wallpaper"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="w-2/5 flex flex-col items-center justify-center bg-gray-50 dark:bg-darkBg h-full overflow-auto">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm flex flex-col items-center gap-4">
            <span className="bg-lightPrimary dark:bg-darkPrimary w-12 h-12 rounded-full flex justify-center">
              <LockClosedIcon width={24} stroke="white" />
            </span>
            <h2 className="text-center text-3xl font-bold leading-9 tracking-tight text-lightText dark:text-darkText uppercase">
              Sign in
            </h2>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
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

              <div>
                <ButtonComp label="Sign in" type="submit" />
              </div>
            </form>
            <div className="text-sm mt-2 flex justify-end">
              <a
                href="#"
                className="font-semibold text-indigo-600 hover:text-indigo-500"
              >
                Forgot password?
              </a>
            </div>
            <p className="mt-10 text-center text-sm text-gray-500">
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
      </div>
    </div>
  );
}
