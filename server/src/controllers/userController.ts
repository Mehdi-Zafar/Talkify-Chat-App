import { Request, Response, NextFunction } from "express";
import * as UserService from "../services/userService";
import { AppError } from "../errors/AppError";
import {
  UpdateUserDataBody,
  UpdateUserByEmailBody,
  ResetPasswordBody,
  IdParam,
  ChatUsersQuery,
} from "../types/requests";
import { getTokenName, parseId } from "../lib/utils";
import { Token } from "../lib/models";
import { env } from "../config/env";

export const getUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = await UserService.getProfile(req.user!.id);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

export const updateUserByEmail = async (
  req: Request<{}, {}, UpdateUserByEmailBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, ...updateData } = req.body;
    const user = await UserService.updateUserByEmail(email, updateData);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

export const updateUserData = async (
  req: Request<IdParam, {}, UpdateUserDataBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = parseId(req.params.id);
    const user = await UserService.updateUser(id, req.user!.id, req.body);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

export const updateUserAvatar = async (
  req: Request<IdParam>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = parseId(req.params.id);
    if (!req.file) throw new AppError(400, "No image file provided");
    const user = await UserService.updateAvatar(id, req.user!.id, req.file);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

export const getChatUsers = async (
  req: Request<IdParam, {}, {}, ChatUsersQuery>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = parseId(req.params.id);
    const users = await UserService.getChatUsers(userId, req.query);
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (
  req: Request<IdParam>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = parseId(req.params.id);
    await UserService.deleteUser(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
