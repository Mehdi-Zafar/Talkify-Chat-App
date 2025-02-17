import { Link, useNavigate } from "react-router-dom";
import {
  ButtonComp,
  InputField,
  PhoneNumberField,
  SelectField,
} from "../../components";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState } from "react";
import {
  Step,
  Stepper,
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import { isPhoneValid, showToast } from "../../utils/helper";
import signUpImg from "../../assets/sign-up.jpg";
import { LockClosedIcon, PencilIcon } from "@heroicons/react/24/outline";
import { AuthAPI } from "../../api";
import { Purpose, User } from "../../utils/contracts";
import OtpInput from "react-otp-input";
import { sendOtp, verifyOtp } from "../../api/OtpAPI/OtpAPI";

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
      .refine((val) => isPhoneValid(val), {
        message: "Phone Number is not Valid",
      }),
  })
  .refine((data) => data.password === data.confirm_password, {
    path: ["confirm_password"],
    message: "Passwords must match",
  });

export default function SignUp() {
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
    const otpres = await verifyOtp({
      email: getValues("email"),
      otp,
      purpose: Purpose.SignUp,
    });
    const res = await AuthAPI.register(data);
    showToast("Sign Up Successful!");
    reset();
    handleOpen();
    setTimeout(() => {
      navigate("/sign-in");
    }, 1000);
  }

  async function sendOtpOnEmail() {
    setLoading(true);
    try {
      const email = getValues("email");
      const res = await sendOtp({ email: getValues("email") });
      showToast("OTP sent to our email.");
      handleOpen();
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  }

  // async function verifyEmailOtp() {
  //   try {
  //     const res = await verifyOtp({ email: getValues("email"), otp });
  //     showToast("OTP Verified");
  //   } catch (err) {
  //     showToast("Error");
  //   }
  // }

  function submitForm() {
    otp?.length < 6
      ? showToast("Fill the numbers completely!")
      : formRef.current.requestSubmit();
  }

  return (
    <>
      <div className="h-screen py-8 flex justify-center">
        <div className="w-4/5 rounded-xl overflow-clip justify-center shadow-sm border border-gray-50 dark:border-darkPrimary">
          {/* <div className="w-2/5">
            <img
              src={signUpImg}
              alt="Sign In Wallpaper"
              className="w-full h-full object-cover"
            />
          </div> */}
          <div className="w-full min-h-full flex-1 px-6 py-8 lg:px-8 bg-gray-50 dark:bg-darkBg">
            <div className="w-full flex flex-col items-center gap-4">
              <span className="bg-lightPrimary dark:bg-darkPrimary w-12 h-12 rounded-full flex justify-center">
                <LockClosedIcon width={24} stroke="white" />
              </span>
              <h2 className="text-center text-3xl uppercase font-bold leading-9 tracking-tight text-lightText dark:text-darkText">
                Sign up
              </h2>
            </div>

            <div className="mt-8 w-full max-w-screen-md mx-auto">
              <form>
                <div className="grid grid-cols-2 gap-4">
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
                <Dialog
                  open={openModal}
                  handler={handleOpen}
                  size="lg"
                  className="px-2 relative bg-lightBg dark:bg-darkBg"
                >
                  <DialogHeader className="text-lightText dark:text-darkText">
                    Verify OTP
                  </DialogHeader>
                  <form ref={formRef} onSubmit={handleSubmit(formSubmit)}>
                    <DialogBody>
                      <div className="flex flex-col gap-4 items-center justify-center my-8">
                        <OtpInput
                          value={otp}
                          onChange={setOtp}
                          numInputs={6}
                          renderSeparator={<span>&nbsp;-&nbsp;</span>}
                          renderInput={(props) => (
                            <input
                              {...props}
                              className="!w-12 !h-12 rounded-md bg-lightBody dark:bg-darkBody !text-lightText dark:!text-darkText border text-lg font-semibold"
                            />
                          )}
                        />
                        <h3 className="font-medium">
                          We have sent an otp to your email address{" "}
                          {getValues("email")}. Please verify!
                        </h3>
                      </div>
                    </DialogBody>
                    <DialogFooter>
                      <>
                        <Button
                          variant="text"
                          color="blue"
                          type="button"
                          onClick={() => setOpenModal(false)}
                          className="mr-1"
                        >
                          <span>Cancel</span>
                        </Button>
                        <Button
                          variant="gradient"
                          color="blue"
                          onClick={() => {
                            formRef ? submitForm() : {};
                          }}
                        >
                          <span>Confirm</span>
                        </Button>
                      </>
                    </DialogFooter>
                  </form>
                </Dialog>
                <div className="mt-6 flex items-center gap-4">
                  <ButtonComp
                    label="Sign Up"
                    type="button"
                    onClick={async () => {
                      if (await trigger()) {
                        await sendOtpOnEmail();
                      }
                    }}
                    loading={loading}
                  />
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
        </div>
      </div>
    </>
  );
}
