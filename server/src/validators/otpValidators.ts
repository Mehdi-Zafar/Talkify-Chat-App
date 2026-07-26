import { z } from "zod";
import { purposeReturnToken } from "../lib/constants";

export const sendOtpSchema = z.object({
  email: z.email("Invalid email address"),
});

// Valid purposes: everything in purposeReturnToken plus "signUp"
const validPurposes = [...purposeReturnToken, "signUp"] as const;

export const verifyOtpSchema = z.object({
  email: z.email("Invalid email address"),
  otp: z.string().min(1, "OTP is required"),
  purpose: z.enum(validPurposes, {
    error: `Purpose must be one of: ${validPurposes.join(", ")}`,
  }),
});
