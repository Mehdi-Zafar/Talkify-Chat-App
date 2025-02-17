import { Purpose } from "./models";

export const purposeReturnToken: Purpose[] = [Purpose.ResetPassword];

export const getHashSalt = () => {
  return Number(process.env.HASH_SALT) || 10;
};
