import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "../errors/AppError";
import * as UserRepository from "../repositories/userRepository";
import {
  UpdateUserDataBody,
  UpdateUserByEmailBody,
  ChatUsersQuery,
  ResetPasswordBody,
} from "../types/requests";
import { hashPassword } from "../lib/utils";

export const getProfile = async (userId: number) => {
  const user = await UserRepository.findById(userId);
  if (!user) throw new AppError(404, "User not found");
  return user;
};

export const getUserById = async (id: number) => {
  const user = await UserRepository.findById(id);
  if (!user) throw new AppError(404, "User not found");
  return user;
};

export const getAllUsers = () => UserRepository.findAll();

export const updateUser = async (
  id: number,
  requesterId: number,
  data: Partial<UpdateUserDataBody>,
) => {
  if (id !== requesterId) throw new AppError(403, "Forbidden");
  return UserRepository.updateById(id, data);
};

export const updateUserByEmail = async (
  email: string,
  data: Omit<UpdateUserByEmailBody, "email">,
) => {
  const existing = await UserRepository.findByEmail(email);
  if (!existing) throw new AppError(404, "User not found");
  return UserRepository.updateByEmail(email, data as Record<string, string>);
};

export const updateAvatar = async (
  id: number,
  requesterId: number,
  file: Express.Multer.File,
) => {
  if (id !== requesterId) throw new AppError(403, "Forbidden");

  // Lazy import — Cloudinary only loaded when needed.
  // When a CDN cache layer is added later, invalidation goes here.
  const { uploadToCloudinary } = await import("../lib/utils");
  const imageUrl = await uploadToCloudinary(file.buffer, file.mimetype);
  return UserRepository.updateImage(id, imageUrl);
};

export const deleteUser = (id: number) => UserRepository.deleteById(id);

export const getChatUsers = async (userId: number, query: ChatUsersQuery) => {
  const result = UserRepository.findByRelation(userId, query);
  // null means unrecognised relationType — repository returns null as the signal
  if (result === null) {
    throw new AppError(
      400,
      "Invalid relationType. Use 'contacts' or 'non-contacts'.",
    );
  }
  return result;
};
