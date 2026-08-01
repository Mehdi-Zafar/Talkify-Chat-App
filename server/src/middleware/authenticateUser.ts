import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { verifyAccessToken, JwtPayload } from "../lib/jwt";

export interface AuthorizedRequest extends Request {
  user?: JwtPayload;
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
    req.user = verifyAccessToken(token);
    next();
  } catch (error) {
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
