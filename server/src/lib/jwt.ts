import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface JwtPayload {
  id: number;
  email: string;
}

export const verifyAccessToken = (token: string): JwtPayload => {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
  return { id: decoded.id, email: decoded.email };
};
