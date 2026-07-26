import prisma from "../lib/prisma";

export const findByEmail = (email: string) =>
  prisma.userOtp.findUnique({ where: { email } });

export const upsert = (email: string, otp: string, otpExpiry: number) =>
  prisma.userOtp.upsert({
    where: { email },
    update: { otp, otp_expiry: otpExpiry },
    create: { email, otp, otp_expiry: otpExpiry },
  });

// Silently ignores "record not found" — safe to call even if OTP was already deleted
export const deleteByEmail = (email: string) =>
  prisma.userOtp.delete({ where: { email } }).catch(() => {});
