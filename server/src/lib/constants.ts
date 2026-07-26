import { env } from "../config/env";

export const REFRESH_TOKEN_COOKIE_NAME = "refreshTokenTalkify";

export const REFRESH_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
} as const;

// OTP purposes that trigger a reset-password cookie on verify
export const purposeReturnToken = ["resetPassword"] as const;

export const OTP_EXPIRY_SECONDS = 300; // 5 minutes
export const RESET_TOKEN_EXPIRY_SECONDS = 600; // 10 minutes
