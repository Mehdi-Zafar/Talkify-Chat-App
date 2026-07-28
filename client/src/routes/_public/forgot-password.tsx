import { createFileRoute } from "@tanstack/react-router";
import { Link, useNavigate } from "@tanstack/react-router";
import { CountdownTimer, InputField } from "../../components";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { sendOtp, verifyOtp } from "../../api/OtpAPI/OtpAPI";
import { OtpRequest, OtpResponse, Purpose } from "../../utils/contracts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import OTPInput from "react-otp-input";
import { useRef, useState } from "react";
import { showToast } from "../../utils/helper";
import logoImg from "@/assets/logo.webp";

export const Route = createFileRoute("/_public/forgot-password")({
  component: ForgotPassword,
});

const FormSchema = z.object({
  email: z.string().min(1, { message: "Email is required" }).email(),
});

function ForgotPassword() {
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({ resolver: zodResolver(FormSchema) });
  const [otp, setOtp] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [otpInfo, setOtpInfo] = useState<OtpResponse | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const navigate = useNavigate();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (data: OtpRequest) => sendOtp(data),
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
      : formRef.current?.requestSubmit();
  }

  async function formSubmit(data: OtpRequest) {
    try {
      const res = await mutateAsync(data);
      setOtpInfo(res);
      setOpenModal(true);
    } catch (err) {}
  }

  async function submitCode(e: React.FormEvent) {
    e.preventDefault();
    try {
      const otpres = await verifyOtp({
        email: getValues("email"),
        otp,
        purpose: Purpose.ResetPassword,
      });
      if (otpres) {
        navigate({
          to: "/reset-password",
          state: { email: getValues("email"), otpData: otpres },
        });
      }
    } catch (err) {}
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-darkBg px-4">
        <div className="w-full max-w-sm flex flex-col items-center gap-4">
          <img src={logoImg} alt="Talkify" className="w-20 object-contain" />
          <h2 className="text-center text-2xl font-bold tracking-tight text-lightText dark:text-darkText uppercase">
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
            <Button className="mt-4 w-full" loading={isPending}>
              Submit
            </Button>
          </form>
          <Link
            to="/sign-in"
            className="text-indigo-600 text-sm underline font-medium"
          >
            Back to Sign In
          </Link>
        </div>
      </div>

      <Dialog open={openModal} onOpenChange={handleOpen}>
        <DialogContent className="max-w-2xl bg-lightBg dark:bg-darkBg">
          <DialogHeader>
            <DialogTitle className="text-lightText dark:text-darkText">
              Verify OTP
            </DialogTitle>
          </DialogHeader>

          <form ref={formRef} onSubmit={submitCode}>
            <div className="flex flex-col gap-4 items-center justify-center my-8">
              <h3 className="font-medium text-lightText dark:text-darkText">
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
                    className="w-12! h-12! rounded-md bg-lightBody dark:bg-darkBody text-lightText! dark:text-darkText! border text-lg font-semibold"
                  />
                )}
              />
              {otpInfo?.timeout ? (
                <h3 className="font-medium">
                  OTP expires in <CountdownTimer seconds={otpInfo?.timeout} />
                </h3>
              ) : null}
              <h5 className="font-medium">
                Did not receive code?{" "}
                <span className="text-indigo-600 underline cursor-pointer">
                  Resend
                </span>
              </h5>
            </div>

            <DialogFooter>
              <Button variant="ghost" type="button" onClick={handleOpen}>
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
