import { Request, Response, NextFunction } from "express";
import { generateOtp, getTokenName } from "../utils/utils";
import nodemailer from "nodemailer";
import { prisma } from "..";
import { sendEmail } from "../middleware/nodemailer";
import { purposeReturnToken } from "../utils/constants";
import jwt from "jsonwebtoken";
import { token } from "morgan";
import { Token } from "../utils/models";

export const sendOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: "Email is required" });
      return;
    }

    // Generate OTP and expiry
    const otp = generateOtp(6);
    const timeInSec = 300;
    const otpExpiry = Math.floor(Date.now() / 1000) + timeInSec; // 5 minutes in seconds

    // Upsert OTP record
    await prisma.userOtp.upsert({
      where: { email },
      update: { otp, otp_expiry: otpExpiry },
      create: { email, otp, otp_expiry: otpExpiry },
    });

    // Send OTP via email
    await sendEmail(email, "Your OTP Code", `Your OTP code is: ${otp}`);

    res
      .status(200)
      .json({ message: "OTP sent successfully", data: { timeOut: timeInSec } });
  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, otp, purpose } = req.body;

    if (!email || !otp || !purpose) {
      res.status(400).json({ message: "Missing required information!" });
      return;
    }

    // Retrieve OTP record
    const otpRecord = await prisma.userOtp.findFirst({ where: { email } });

    if (!otpRecord) {
      res.status(404).json({ message: "OTP not found" });
      return;
    }

    // Validate OTP and expiry
    const currentTime = Math.floor(Date.now() / 1000);
    if (otpRecord.otp !== otp || otpRecord.otp_expiry < currentTime) {
      res.status(400).json({ message: "Invalid or expired OTP" });
      return;
    }

    const timeOut = 600;
    let resObj: {
      message: string;
      data?: { timeOut?: number };
    } = {
      message: "OTP verified successfully",
      data: { timeOut },
    };

    if (purposeReturnToken.includes(purpose)) {
      const token = jwt.sign({ email }, process.env.JWT_SECRET as string, {
        expiresIn: `${timeOut}s`,
      });
      resObj.data = { timeOut };
      res.cookie(getTokenName(Token.ResetPassword), token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: timeOut * 1000,
      });
    } else {
      delete resObj.data;
    }
    // If OTP is valid, delete the record and return success
    await prisma.userOtp.delete({ where: { email } });

    res.status(200).json(resObj);
  } catch (error) {
    next(error);
  }
};
