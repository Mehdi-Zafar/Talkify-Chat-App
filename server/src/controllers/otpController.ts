import { Request, Response, NextFunction } from "express";
import { generateOtp } from "../utils/utils";
import nodemailer from "nodemailer";
import { prisma } from "..";
import { sendEmail } from "../middleware/nodemailer";

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

    // Check if the email already exists
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({ error: "Email is already in use" });
      return;
    }

    // Generate OTP and expiry
    const otp = generateOtp(6);
    const otpExpiry = Math.floor(Date.now() / 1000) + 300; // 5 minutes in seconds

    // Upsert OTP record
    await prisma.userOtp.upsert({
      where: { email },
      update: { otp, otp_expiry: otpExpiry },
      create: { email, otp, otp_expiry: otpExpiry },
    });

    // Send OTP via email
    await sendEmail(email, "Your OTP Code", `Your OTP code is: ${otp}`);

    res.status(200).json({ message: "OTP sent successfully" });
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
    const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(400).json({ message: "Email and OTP are required" });
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

    // If OTP is valid, delete the record and return success
    await prisma.userOtp.delete({ where: { email } });

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    next(error);
  }
};
