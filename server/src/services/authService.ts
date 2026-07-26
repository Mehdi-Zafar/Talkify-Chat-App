import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "../errors/AppError";
import * as UserRepository from "../repositories/userRepository";
import { RegisterBody } from "../types/requests";
import { comparePassword, hashPassword, toPublicUser } from "../lib/utils";
import { PublicUser } from "../lib/models";

const ACCESS_TOKEN_EXPIRY = "1h";
const REFRESH_TOKEN_EXPIRY = "7d";

export const generateAccessToken = (id: number, email: string): string =>
  jwt.sign({ id, email }, env.JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });

export const generateRefreshToken = (id: number, email: string): string =>
  jwt.sign({ id, email }, env.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });

export const verifyRefreshToken = (
  token: string,
): { id: number; email: string } =>
  // jwt.verify throws JsonWebTokenError / TokenExpiredError on failure —
  // the controller catches these and maps them to 401 responses
  jwt.verify(token, env.JWT_REFRESH_SECRET) as { id: number; email: string };

export const login = async (
  email: string,
  password: string,
): Promise<{ user: PublicUser; accessToken: string; refreshToken: string }> => {
  const user = await UserRepository.findByEmail(email);

  if (!user || !(await comparePassword(password, user.password))) {
    throw new AppError(401, "Invalid credentials");
  }

  return {
    user: toPublicUser(user),
    accessToken: generateAccessToken(user.id, user.email),
    refreshToken: generateRefreshToken(user.id, user.email),
  };
};

export const register = async (data: RegisterBody) => {
  const existing = await UserRepository.findByEmail(data.email);
  if (existing) {
    throw new AppError(409, "Email is already in use");
  }

  const hashedPassword = await hashPassword(data.password);
  return UserRepository.insert(data, hashedPassword);
};

export const refreshAccess = (refreshToken: string): string => {
  // Throws TokenExpiredError or JsonWebTokenError if invalid —
  // authController maps these specifically to 401
  const payload = verifyRefreshToken(refreshToken);
  return generateAccessToken(payload.id, payload.email);
};

export const resetPassword = async (
  token: string,
  email: string,
  newPassword: string,
) => {
  // Verify the reset token — throws JsonWebTokenError / TokenExpiredError on failure
  let payload: { email: string };
  try {
    payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as { email: string };
  } catch {
    throw new AppError(401, "Invalid or expired reset token");
  }

  if (payload.email !== email) {
    throw new AppError(403, "Token does not match email");
  }

  const existing = await UserRepository.findByEmail(email);
  if (!existing) throw new AppError(404, "User not found");

  const hashed = await hashPassword(newPassword);
  await UserRepository.updatePassword(email, hashed);
};
