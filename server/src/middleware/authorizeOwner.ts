// src/middleware/authorizeOwner.ts
import { Request, Response, NextFunction } from "express";
import { parseId } from "../lib/utils";

const authorizeOwner = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const requestedId = parseId(req.params.id);
  const loggedInId = req.user?.id;

  if (requestedId !== loggedInId) {
    res.status(403).json({
      success: false,
      message: "Forbidden — you can only modify your own data",
    });
    return;
  }

  next();
};

export default authorizeOwner;
