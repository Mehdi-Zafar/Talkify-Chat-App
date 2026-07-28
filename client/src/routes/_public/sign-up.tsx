import { createFileRoute } from "@tanstack/react-router";
import { Link, useNavigate } from "@tanstack/react-router";
import { InputField, PhoneNumberField, SelectField } from "../../components";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { showToast } from "../../utils/helper";
import { AuthAPI } from "../../api";
import { Purpose, User } from "../../utils/contracts";
import OtpInput from "react-otp-input";
import { sendOtp, verifyOtp } from "../../api/OtpAPI/OtpAPI";
import { isValidPhoneNumber } from "react-phone-number-input";
import logoImg from "../../assets/logo.webp";

export const Route = createFileRoute("/_public/sign-up")({
  component: SignUp,
});

const FormSchema = z
  .object({
    user_name: z.string().min(1, { message: "Username is required" }),
    email: z.string().min(1, { message: "Email is required" }).email(),
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
    gender: z.string().min(1, { message: "Gender is required" }),
    phone_number: z
      .string()
      .min(1, { message: "Phone Number is required" })
      .refine((val) => isValidPhoneNumber(val), {
        message: "Phone Number is not Valid",
      }),
  })
  .refine((data) => data.password === data.confirm_password, {
    path: ["confirm_password"],
    message: "Passwords must match",
  });

function SignUp() {
  const {
    register,
    handleSubmit,
    getValues,
    trigger,
    reset,
    formState: { errors },
  } = useForm({ mode: "onChange", resolver: zodResolver(FormSchema) });
  const [openModal, setOpenModal] = useState(false);
  const [otp, setOtp] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleOpen = () => setOpenModal((prev) => !prev);

  async function formSubmit(data: User) {
    await verifyOtp({
      email: getValues("email"),
      otp,
      purpose: Purpose.SignUp,
    });
    await AuthAPI.register(data);
    showToast("Sign Up Successful!");
    reset();
    handleOpen();
    setTimeout(() => {
      navigate({ to: "/sign-in" });
    }, 1000);
  }

  async function sendOtpOnEmail() {
    setLoading(true);
    try {
      await sendOtp({ email: getValues("email") });
      showToast("OTP sent to your email.");
      handleOpen();
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  }

  function submitForm() {
    otp?.length < 6
      ? showToast("Fill the numbers completely!")
      : formRef.current?.requestSubmit();
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-darkBg px-4 py-8">
        <div className="w-full max-w-2xl bg-white dark:bg-darkPrimary rounded-xl shadow-md border border-gray-100 dark:border-darkPrimary px-8 py-10">
          <div className="flex flex-col items-center gap-3 mb-8">
            <img src={logoImg} alt="Talkify" className="w-20 object-contain" />
            <h2 className="text-center text-2xl font-bold tracking-tight text-lightText dark:text-darkText uppercase">
              Sign up
            </h2>
          </div>

          <form>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Username"
                name="user_name"
                placeholder="Enter Username"
                register={{ ...register("user_name") }}
                error={errors["user_name"]}
              />
              <InputField
                label="Email"
                name="email"
                placeholder="Enter Email"
                register={{ ...register("email") }}
                error={errors["email"]}
              />
              <PhoneNumberField
                label="Phone Number"
                name="phone_number"
                placeholder="Enter Phone Number"
                value={getValues("phone_number")}
                register={{ ...register("phone_number") }}
                error={errors["phone_number"]}
              />
              <SelectField
                label="Gender"
                options={[
                  { label: "Male", value: "male" },
                  { label: "Female", value: "female" },
                ]}
                placeholder="Select Gender"
                register={{ ...register("gender") }}
                error={errors["gender"]}
              />
              <InputField
                label="Password"
                name="password"
                type="password"
                placeholder="Enter Password"
                register={{ ...register("password") }}
                error={errors["password"]}
              />
              <InputField
                label="Confirm Password"
                name="confirm_password"
                type="password"
                placeholder="Enter Confirm Password"
                register={{ ...register("confirm_password") }}
                error={errors["confirm_password"]}
              />
            </div>

            <div className="mt-6">
              <Button
                type="button"
                className="w-full"
                onClick={async () => {
                  if (await trigger()) {
                    await sendOtpOnEmail();
                  }
                }}
                loading={loading}
              >
                Sign Up
              </Button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already a member?{" "}
            <Link
              to="/sign-in"
              className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>

      <Dialog open={openModal} onOpenChange={handleOpen}>
        <DialogContent className="max-w-2xl bg-lightBg dark:bg-darkBg">
          <DialogHeader>
            <DialogTitle className="text-lightText dark:text-darkText">
              Verify OTP
            </DialogTitle>
          </DialogHeader>

          <form ref={formRef} onSubmit={handleSubmit(formSubmit)}>
            <div className="flex flex-col gap-4 items-center justify-center my-8">
              <OtpInput
                value={otp}
                onChange={setOtp}
                numInputs={6}
                renderSeparator={<span>&nbsp;-&nbsp;</span>}
                renderInput={(props) => (
                  <input
                    {...props}
                    className="w-12! h-12! rounded-md bg-lightBody dark:bg-darkBody text-lightText! dark:text-darkText! border text-lg font-semibold"
                  />
                )}
              />
              <h3 className="font-medium text-lightText dark:text-darkText">
                We have sent an otp to your email address {getValues("email")}.
                Please verify!
              </h3>
            </div>

            <DialogFooter>
              <Button
                variant="ghost"
                type="button"
                onClick={() => setOpenModal(false)}
              >
                Cancel
              </Button>
              <Button type="button" onClick={submitForm}>
                Confirm
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
