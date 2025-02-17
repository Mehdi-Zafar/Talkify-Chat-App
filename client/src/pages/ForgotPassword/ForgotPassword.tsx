import { Link, useNavigate } from "react-router-dom";
import { ButtonComp, CountdownTimer, InputField } from "../../components";
import { LockClosedIcon } from "@heroicons/react/24/outline";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { sendOtp, verifyOtp } from "../../api/OtpAPI/OtpAPI";
import { OtpRequest, OtpResponseData, Purpose } from "../../utils/contracts";
import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
} from "@material-tailwind/react";
import OTPInput from "react-otp-input";
import { useRef, useState } from "react";
import { showToast } from "../../utils/helper";

const FormSchema = z.object({
  email: z.string().min(1, { message: "Email is required" }).email(),
});

export default function ForgotPassword() {
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm({ resolver: zodResolver(FormSchema) });
  const [otp, setOtp] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [otpInfo, setOtpInfo] = useState<OtpResponseData | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const navigate = useNavigate();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (data: OtpRequest) => {
      return sendOtp(data);
    },
  });

  function handleOpen() {
    if (openModal && otp?.length > 0) {
      const close = confirm("Do you want to close?");
      if (!close) return;
    }
    setOpenModal((prev) => !prev);
  }

  function submitForm() {
    otp?.length < 6
      ? showToast("Fill the numbers completely!")
      : formRef.current.requestSubmit();
  }

  async function formSubmit(data: OtpRequest) {
    try {
      const res = await mutateAsync(data);
      setOtpInfo(res?.data);
      setOpenModal(true);
    } catch (err) {}
  }

  async function submitCode(e) {
    e.preventDefault();
    try {
      const otpres = await verifyOtp({
        email: getValues("email"),
        otp,
        purpose: Purpose.ResetPassword,
      });
      if (otpres?.data) {
        navigate("/reset-password", {
          state: { email: getValues("email"), otpData: otpres?.data },
          replace: true,
        });
      }
    } catch (err) {}
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-darkBg h-full overflow-auto">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm flex flex-col items-center gap-4">
          <span className="bg-lightPrimary dark:bg-darkPrimary w-12 h-12 rounded-full flex justify-center">
            <LockClosedIcon width={24} stroke="white" />
          </span>
          <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-lightText dark:text-darkText uppercase">
            Forgot Password
          </h2>
          <form
            onSubmit={handleSubmit(formSubmit)}
            className="w-full flex flex-col gap-2"
          >
            <InputField
              placeholder="Enter Email"
              containerClass="block w-full"
              register={{ ...register("email") }}
              error={errors["email"]}
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
      <Dialog
        open={openModal}
        handler={handleOpen}
        size="lg"
        className="px-2 relative bg-lightBg dark:bg-darkBg"
      >
        <DialogHeader className="text-lightText dark:text-darkText">
          Verify OTP
        </DialogHeader>
        <form ref={formRef} onSubmit={submitCode}>
          <DialogBody>
            <div className="flex flex-col gap-4 items-center justify-center my-8">
              <h3 className="font-medium">
                We have sent an otp to your email address {getValues("email")}.
                Please verify!
              </h3>
              <OTPInput
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
              {otpInfo?.timeOut ? (
                <h3 className="font-medium">
                  OTP expires in <CountdownTimer seconds={otpInfo?.timeOut} />
                </h3>
              ) : null}
              <h5 className="font-medium">
                Did not receive code?{" "}
                <span className="text-indigo-600 underline cursor-pointer">
                  Resend
                </span>
              </h5>
            </div>
          </DialogBody>
          <DialogFooter>
            <>
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
    </>
  );
}
