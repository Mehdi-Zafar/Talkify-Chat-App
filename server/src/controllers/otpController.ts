import { Request, Response, NextFunction } from "express";
import { sendEmail } from "../middleware/nodemailer";
import * as OtpService from "../services/otpService";
import { AppError } from "../errors/AppError";
import { SendOtpBody, VerifyOtpBody } from "../types/requests";
import {
  OTP_EXPIRY_SECONDS,
  RESET_TOKEN_EXPIRY_SECONDS,
} from "../lib/constants";
import { env } from "../config/env";

export const sendOtp = async (
  req: Request<{}, {}, SendOtpBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email } = req.body;
    const otp = await OtpService.createAndStoreOtp(email);

    // Email failure rolls back the OTP — user gets a clean error to retry
    try {
      await sendEmail(email, "Your OTP Code", `Your OTP code is: ${otp}`);
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError);
      // Roll back the stored OTP so the user isn't stuck with an undelivered one
      await OtpService.rollbackOtp(email);
      throw new AppError(500, "Failed to send OTP email. Please try again.");
    }

    res
      .status(200)
      .json({ message: "OTP sent successfully", timeout: OTP_EXPIRY_SECONDS });
  } catch (err) {
    next(err);
  }
};

export const verifyOtp = async (
  req: Request<{}, {}, VerifyOtpBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, otp, purpose } = req.body;
    const result = await OtpService.verifyOtp(email, otp, purpose);

    // If the service returned a reset token, set the cookie and respond with timeout
    if (result.resetToken && result.cookieName) {
      res.cookie(result.cookieName, result.resetToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: RESET_TOKEN_EXPIRY_SECONDS * 1000,
      });
      res.status(200).json({
        message: "OTP verified successfully",
        timeout: result.timeout,
      });
      return;
    }

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (err) {
    next(err);
  }
};
