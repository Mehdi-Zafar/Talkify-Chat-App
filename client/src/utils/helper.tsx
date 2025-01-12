import { PhoneNumberUtil } from "google-libphonenumber";
import toast, { ToastType } from "react-hot-toast";
import { io } from "socket.io-client";
import { createClient } from "@supabase/supabase-js";

// "undefined" means the URL will be computed from the `window.location` object
const URL = "http://localhost:3000";

export const getSocketInstance = () => {
  const socket = io(URL);
  return socket;
};

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_API_KEY
);

const phoneUtil = PhoneNumberUtil.getInstance();

export const isPhoneValid = (phone: string) => {
  try {
    return phoneUtil.isValidNumber(phoneUtil.parseAndKeepRawInput(phone));
  } catch (error) {
    return false;
  }
};

export const showToast = (msg: string, type?: ToastType) => {
  if (type === "success") {
    toast.success(msg, { position: "top-right", duration: 3000 });
  } else if (type === "error") {
    toast.error(msg, { position: "top-right", duration: 3000 });
  } else if (type === "loading") {
    toast.loading(msg, { position: "top-right", duration: 3000 });
  } else {
    toast(msg, { position: "top-right", duration: 3000 });
  }
};
