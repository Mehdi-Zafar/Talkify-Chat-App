import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Retrieve the token from the Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is missing or invalid",
      });
    }

    const token = authHeader.split(" ")[1];

    // Verify the token
    const secretKey = process.env.JWT_SECRET_KEY as string;
    if (!secretKey) {
      throw new Error("JWT secret key is not defined in environment variables");
    }

    const decoded = jwt.verify(token, secretKey);

    // Attach the decoded token to the request object for further use
    // req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export default authenticateUser;
