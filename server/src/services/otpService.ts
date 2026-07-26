import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "../errors/AppError";
import * as OtpRepository from "../repositories/otpRepository";
import {
  OTP_EXPIRY_SECONDS,
  RESET_TOKEN_EXPIRY_SECONDS,
  purposeReturnToken,
} from "../lib/constants";
import { generateOtp, getTokenName } from "../lib/utils";
import { Token } from "../lib/models";

export const createAndStoreOtp = async (email: string): Promise<number> => {
  const otp = generateOtp(6);
  const otpExpiry = Math.floor(Date.now() / 1000) + OTP_EXPIRY_SECONDS;
  await OtpRepository.upsert(email, otp, otpExpiry);
  return parseInt(otp);
};

// Returns either { timeout } for regular verify, or { timeout, resetToken, cookieName }
// when the purpose requires a password-reset cookie. Controller decides what to do with it.
export const verifyOtp = async (
  email: string,
  otp: string,
  purpose: string,
): Promise<{ timeout?: number; resetToken?: string; cookieName?: string }> => {
  const record = await OtpRepository.findByEmail(email);
  if (!record) {
    throw new AppError(404, "OTP not found");
  }

  const currentTime = Math.floor(Date.now() / 1000);
  if (record.otp_expiry < currentTime) {
    // Clean up the expired record before rejecting
    await OtpRepository.deleteByEmail(email);
    throw new AppError(400, "OTP has expired. Request a new one.");
  }

  if (record.otp !== otp) {
    throw new AppError(400, "Invalid OTP");
  }

  await OtpRepository.deleteByEmail(email);

  if ((purposeReturnToken as readonly string[]).includes(purpose)) {
    const resetToken = jwt.sign({ email }, env.JWT_ACCESS_SECRET, {
      expiresIn: `${RESET_TOKEN_EXPIRY_SECONDS}s`,
    });
    return {
      timeout: RESET_TOKEN_EXPIRY_SECONDS,
      resetToken,
      cookieName: getTokenName(Token.ResetPassword),
    };
  }

  return {};
};

export const rollbackOtp = (email: string) =>
  OtpRepository.deleteByEmail(email);
