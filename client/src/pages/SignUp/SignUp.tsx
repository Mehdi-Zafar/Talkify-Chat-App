import { Link } from "react-router-dom";
import {
  ButtonComp,
  InputField,
  PhoneNumberField,
  SelectField,
} from "../../components";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
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

const FormSchema = z
  .object({
    username: z.string().min(1, { message: "Username is required" }),
    email: z.string().min(1, { message: "Email is required" }).email(),
    password: z.string().min(1, { message: "Password is required" }),
    confirm_password: z.string().min(1, { message: "Password is required" }),
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
    formState: { errors },
  } = useForm({ mode: "onChange", resolver: zodResolver(FormSchema) });
  const [activeStep, setActiveStep] = useState(0);
  const [isLastStep, setIsLastStep] = useState(false);
  const [isFirstStep, setIsFirstStep] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [fieldsDisabled, setFieldsDisabled] = useState(true);

  const handleOpen = () => setOpenModal((prev) => !prev);

  const handleNext = async () => {
    if (
      (activeStep === 0 && (await trigger(["username", "email"]))) ||
      (activeStep === 1 && (await trigger(["gender", "phone_number"])))
    ) {
      setActiveStep((cur) => cur + 1);
    } else if (
      activeStep === 2 &&
      (await trigger(["password", "confirmPassword"]))
    ) {
      handleOpen();
    }
  };
  const handlePrev = () => !isFirstStep && setActiveStep((cur) => cur - 1);

  function formSubmit(data: any) {
    console.log(data);
    showToast("Sign Up Successful!");
    handleOpen();
  }

  return (
    <>
      <div className="h-screen py-8 flex justify-center">
        <div className="flex h-full w-11/12 rounded-xl overflow-clip justify-center shadow-md border border-gray-50 dark:border-darkPrimary">
          <div className="w-3/5">
            <img
              src={signUpImg}
              alt="Sign In Wallpaper"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="w-2/5 flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-gray-50 dark:bg-darkBg">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm flex flex-col items-center gap-4">
              <span className="bg-lightPrimary dark:bg-darkPrimary w-12 h-12 rounded-full flex justify-center">
                <LockClosedIcon width={24} stroke="white" />
              </span>
              <h2 className="text-center text-3xl uppercase font-bold leading-9 tracking-tight text-lightText dark:text-darkText">
                Sign up
              </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
              <form>
                <div className="space-y-3">
                  <Stepper
                    className="mb-8"
                    activeStep={activeStep}
                    isLastStep={(value) => setIsLastStep(value)}
                    isFirstStep={(value) => setIsFirstStep(value)}
                  >
                    <Step
                      className={`${
                        activeStep >= 0 &&
                        "!bg-lightPrimary dark:!bg-darkPrimary text-white"
                      }`}
                      // onClick={() => setActiveStep(0)}
                    >
                      1
                    </Step>
                    <Step
                      className={`${
                        activeStep >= 1 &&
                        "!bg-lightPrimary dark:!bg-darkPrimary !text-white"
                      } text-lightText`}
                      // onClick={() => setActiveStep(1)}
                    >
                      2
                    </Step>
                    <Step
                      className={`${
                        activeStep >= 2 &&
                        "!bg-lightPrimary dark:!bg-darkPrimary !text-white"
                      } text-lightText`}
                      // onClick={() => setActiveStep(2)}
                    >
                      3
                    </Step>
                  </Stepper>
                  {activeStep === 0 ? (
                    <>
                      <InputField
                        label="Username"
                        name="username"
                        placeholder="Enter Username"
                        register={{ ...register("username") }}
                        error={errors["username"]}
                      />
                      <InputField
                        label="Email"
                        name="email"
                        placeholder="Enter Email"
                        register={{ ...register("email") }}
                        error={errors["email"]}
                      />
                    </>
                  ) : activeStep === 1 ? (
                    <>
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
                    </>
                  ) : activeStep === 2 ? (
                    <>
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
                    </>
                  ) : null}
                </div>
                <Dialog
                  open={openModal}
                  handler={handleOpen}
                  size="lg"
                  className="px-2 relative bg-lightBg dark:bg-darkBg"
                >
                  <span
                    className="absolute top-2 right-2 cursor-pointer w-8 h-8 flex justify-center items-center border rounded-md border-primary"
                    onClick={() => setFieldsDisabled(false)}
                  >
                    <PencilIcon width={16} />
                  </span>
                  <DialogHeader className="text-lightText dark:text-darkText">
                    Review Fields
                  </DialogHeader>
                  <form onSubmit={handleSubmit(formSubmit)}>
                    <DialogBody className="grid grid-cols-2 gap-4">
                      <InputField
                        label="Username"
                        name="username"
                        placeholder="Enter Username"
                        register={{ ...register("username") }}
                        error={errors["username"]}
                        disabled={fieldsDisabled}
                      />
                      <InputField
                        label="Email"
                        name="email"
                        placeholder="Enter Email"
                        register={{ ...register("email") }}
                        error={errors["email"]}
                        disabled={fieldsDisabled}
                      />
                      <PhoneNumberField
                        label="Phone Number"
                        name="phone_number"
                        placeholder="Enter Phone Number"
                        value={getValues("phone_number")}
                        register={{ ...register("phone_number") }}
                        error={errors["phone_number"]}
                        disabled={fieldsDisabled}
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
                        disabled={fieldsDisabled}
                      />
                      <InputField
                        label="Password"
                        name="password"
                        type="password"
                        placeholder="Enter Password"
                        register={{ ...register("password") }}
                        error={errors["password"]}
                        disabled={fieldsDisabled}
                      />
                      <InputField
                        label="Confirm Password"
                        name="confirm_password"
                        type="password"
                        placeholder="Enter Confirm Password"
                        register={{ ...register("confirm_password") }}
                        error={errors["confirm_password"]}
                        disabled={fieldsDisabled}
                      />
                    </DialogBody>
                    <DialogFooter>
                      <Button
                        variant="text"
                        color="blue"
                        type="button"
                        onClick={handleOpen}
                        className="mr-1"
                      >
                        <span>Cancel</span>
                      </Button>
                      <Button
                        variant="gradient"
                        color="blue"
                        type="submit"
                        // onClick={() => {
                        //   handleOpen();
                        // }}
                      >
                        <span>Confirm</span>
                      </Button>
                    </DialogFooter>
                  </form>
                </Dialog>
                <div className="mt-6 flex items-center gap-4">
                  {!isFirstStep && (
                    <ButtonComp
                      label="Previous"
                      type="button"
                      onClick={handlePrev}
                    />
                  )}
                  {!isLastStep && (
                    <ButtonComp
                      label="Next"
                      type="button"
                      onClick={handleNext}
                    />
                  )}
                  {isLastStep && (
                    <ButtonComp
                      type="button"
                      onClick={handleNext}
                      label="Review"
                    />
                  )}
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
