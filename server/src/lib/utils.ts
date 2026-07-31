import { users } from "@prisma/client";
import cloudinary from "../config/cloudinary";
import { env } from "../config/env";
import { PUBLIC_USER_FIELDS } from "../repositories/userRepository";
import { PublicUser, Token } from "./models";
import bcrypt from "bcryptjs";

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

export const uploadToCloudinary = (
  buffer: Buffer,
  mimetype: string,
  folder: string = "talkify",
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder, // organizes uploads in Cloudinary dashboard
        resource_type: "image",
        transformation: [
          { width: 500, height: 500, crop: "fill" }, // auto resize avatars
          { quality: "auto" }, // auto compress
        ],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result!.secure_url); // returns https URL
      },
    );
    stream.end(buffer);
  });
};

export const hashPassword = async (password: string) => {
  return bcrypt.hash(password, env.BCRYPT_ROUNDS);
};

export const comparePassword = async (
  originalPassword: string,
  hashedPassword: string,
) => {
  return bcrypt.compare(originalPassword, hashedPassword);
};

export const toPublicUser = (user: users): PublicUser =>
  Object.fromEntries(
    Object.keys(PUBLIC_USER_FIELDS).map((key) => [
      key,
      user[key as keyof typeof PUBLIC_USER_FIELDS],
    ]),
  ) as Pick<users, keyof typeof PUBLIC_USER_FIELDS>;

export const parseId = (id: string): number => {
  return parseInt(id, 10);
};

export const parsePagination = (page?: string, limit?: string) => {
  const parsedPage = page ? parseInt(page, 10) : 1;
  const parsedLimit = limit ? parseInt(limit, 10) : 20;

  return {
    page: Math.max(1, parsedPage), // Fallback min 1
    limit: Math.min(100, Math.max(1, parsedLimit)), // Max 100, min 1
  };
};
