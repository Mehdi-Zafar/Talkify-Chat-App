// src/middleware/authenticateUser.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

interface jwtPayload {
  id: number;
  email: string;
}

export interface AuthorizedRequest extends Request {
  user?: jwtPayload;
}

const authenticateUser = (
  req: AuthorizedRequest,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Authentication token is missing",
      });
      return;
    }

    const token = authHeader.split(" ")[1];
    const secretKey = env.JWT_ACCESS_SECRET;

    const decoded = jwt.verify(token, secretKey) as {
      id: number;
      email: string;
    };

    // Fixed: actually attach decoded user to request
    // Controllers can now access req.user.id safely
    req.user = { id: decoded.id, email: decoded.email };

    next();
  } catch (error) {
    // Distinguish expired vs invalid — client knows whether to refresh or re-login
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: "Token expired",
        code: "TOKEN_EXPIRED",
      });
      return;
    }

    res.status(401).json({
      success: false,
      message: "Invalid token",
      code: "TOKEN_INVALID",
    });
  }
};

export default authenticateUser;
