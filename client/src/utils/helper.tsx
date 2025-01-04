import { PhoneNumberUtil } from "google-libphonenumber";
import toast from "react-hot-toast";

const phoneUtil = PhoneNumberUtil.getInstance();

export const isPhoneValid = (phone) => {
  try {
    return phoneUtil.isValidNumber(phoneUtil.parseAndKeepRawInput(phone));
  } catch (error) {
    return false;
  }
};

export const showToast = (msg) => {
  toast(msg);
};
