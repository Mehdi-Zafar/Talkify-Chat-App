import { Token } from "./models";

export const generateOtp = (length: number = 6): string => {
  const digits = "0123456789";
  let otp = "";

  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }

  return otp;
};

export const getTokenName = (name: Token) => {
  return `${name}Talkify`;
};
