import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "..";
import { sendEmail } from "../middleware/nodemailer";

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Destructure email and password from the request body
    const { email, password } = req.body;

    // Find the user by email
    const user = await prisma.users.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      // If the user is not found, send an error response
      res.status(400).json({ error: "Invalid credentials" });
      return;
    }

    // Compare the provided password with the hashed password stored in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // If the password is invalid, send an error response
      res.status(400).json({ error: "Invalid credentials" });
      return;
    }

    // Generate a JWT token
    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET as string, // Ensure JWT_SECRET is in .env
      { expiresIn: "1h" } // Token expiration time
    );
    const refreshToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET as string, // Ensure JWT_SECRET is in .env
      { expiresIn: "7d" } // Token expiration time
    );

    const emailSend = await sendEmail(user.email, "Sign In", "Welcome!");

    res.cookie("refreshTokenTalkify", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: "strict", // Ensures the cookie is sent only from your site
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    });

    // Send the token to the client
    res.status(200).json({ message: "Login successful", token: accessToken });
  } catch (err) {
    next(err); // Pass any error to the error handling middleware
  }
};

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, user_name, phone_number, gender } = req.body;

    // Check if the email already exists
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({ error: "Email is already in use" });
      return;
    }

    // Validate input (optional but recommended)
    if (!email || !password || !user_name || !phone_number || !gender) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = await prisma.users.create({
      data: {
        user_name,
        email,
        phone_number,
        gender,
        password: hashedPassword, // Store hashed password
      },
    });

    // Send a success response
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        user_name: user.user_name,
        email: user.email,
        phone_number: user.phone_number,
        gender: user.gender,
      },
    });
  } catch (err) {
    next(err); // Pass errors to the error-handling middleware
  }
};

export const logoutUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  res.clearCookie("refreshTokenTalkify", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const refreshAccessToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  const refreshToken = req.cookies?.refreshTokenTalkify;

  if (!refreshToken) {
    res.status(401).json({ error: "No refresh token provided" });
    return;
  }

  try {
    // Verify the refresh token
    const payload = jwt.verify(
      refreshToken,
      process.env.JWT_SECRET as string
    ) as { id: number; email: string };

    // Generate a new access token
    const accessToken = jwt.sign(
      { id: payload.id, email: payload.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      success: true,
      message: "Access token refreshed",
      data: { accessToken },
    });
  } catch (error) {
    res.status(401).json({ error: "Invalid or missing token! Sign in Again." });
  }
};
