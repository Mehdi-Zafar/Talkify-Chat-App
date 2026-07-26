import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import * as AuthService from "../services/authService";
import { AppError } from "../errors/AppError";
import { LoginBody, RegisterBody, ResetPasswordBody } from "../types/requests";
import {
  REFRESH_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_OPTIONS,
} from "../lib/constants";
import { getTokenName } from "../lib/utils";
import { Token } from "../lib/models";
import { env } from "../config/env";

export const loginUser = async (
  req: Request<{}, {}, LoginBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await AuthService.login(
      email,
      password,
    );

    // Fire-and-forget — login must not fail due to email issues
    // sendEmail(email, "Sign In", "Welcome!").catch((err) =>
    //   console.error("Login email failed:", err),
    // );

    res.cookie(
      REFRESH_TOKEN_COOKIE_NAME,
      refreshToken,
      REFRESH_TOKEN_COOKIE_OPTIONS,
    );
    res
      .status(200)
      .json({ user, token: accessToken, message: "Login Successful!" });
  } catch (err) {
    next(err);
  }
};

export const registerUser = async (
  req: Request<{}, {}, RegisterBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = await AuthService.register(req.body);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};

export const logoutUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_OPTIONS);
    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
};

export const refreshAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];
    if (!refreshToken) {
      throw new AppError(401, "No refresh token provided");
    }

    const accessToken = AuthService.refreshAccess(refreshToken);
    res.status(200).json({ accessToken });
  } catch (err) {
    // Map JWT-specific errors to 401 — everything else goes to the global handler
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: "Refresh token expired" });
      return;
    }
    if (err instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: "Invalid refresh token" });
      return;
    }
    next(err);
  }
};

export const resetUserPassword = async (
  req: Request<{}, {}, ResetPasswordBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = req.cookies?.[getTokenName(Token.ResetPassword)];
    if (!token) throw new AppError(400, "Reset token missing");

    const { email, password } = req.body;
    await AuthService.resetPassword(token, email, password);

    res.clearCookie(getTokenName(Token.ResetPassword), {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    next(err);
  }
};
