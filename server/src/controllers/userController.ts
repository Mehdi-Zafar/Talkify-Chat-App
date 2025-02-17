import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { prisma, supabase } from "..";
import jwt from "jsonwebtoken";
import multer from "multer";
import { getTokenName } from "../utils/utils";
import { Token, UserRelationType } from "../utils/models";
import { getHashSalt } from "../utils/constants";

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Check if the email already exists
    const existingUser = await prisma.users.findUnique({
      where: {
        email: req.body.email,
      },
    });

    if (existingUser) {
      // Return error if email already exists
      res.status(400).json({ error: "Email is already in use" });
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Create a new user with hashed password
    const user = await prisma.users.create({
      data: {
        ...req.body,
        password: hashedPassword, // Store the hashed password
      },
    });

    res.status(201).json(user); // Return the created user
  } catch (err) {
    next(err); // Pass error to the error handling middleware
  }
};

// Other CRUD functions...

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let users = await prisma.users.findMany({
      select: {
        id: true,
        user_name: true,
        email: true,
        phone_number: true,
        gender: true,
        image: true,
      },
    });
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (isNaN(parseInt(req.params.id))) {
      next();
    }
    const user = await prisma.users.findUnique({
      where: { id: parseInt(req.params.id, 10) },
    });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

export const updateUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await prisma.users.update({
      where: { id: parseInt(req.params.id, 10) },
      data: req.body,
    });
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

export const updateUserByEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, ...updateData } = req.body;

    // Check if email is provided
    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    // Check if updateData is provided
    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ error: "No data provided to update" });
      return;
    }

    // Check if the user exists
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (!existingUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Update the user with the provided data
    const updatedUser = await prisma.users.update({
      where: { email },
      data: updateData, // Dynamically update any provided fields
    });

    res.status(200).json({ message: "Password Updated!" });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await prisma.users.delete({ where: { id: parseInt(req.params.id, 10) } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const getUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.refreshTokenTalkify;

    if (!token) {
      res.status(400).json({ success: false, message: "Token is required" });
      return;
    }

    const secretKey = process.env.JWT_SECRET as string;
    // Decode the token to extract the user ID
    const decoded = jwt.verify(token, secretKey) as { id: number };

    if (!decoded || !decoded.id) {
      res.status(400).json({ success: false, message: "Invalid token" });
      return;
    }

    console.log(`ID is ${decoded.id}`);

    // Fetch user using the ID
    const user = await prisma.users.findUnique({
      where: { id: parseInt(decoded.id.toString()) },
      select: {
        id: true,
        email: true,
        user_name: true,
        image: true,
      },
    });

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error decoding token or fetching user:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateUserData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, about } = req.body;
    const file = req.file; // Assuming multer is used for handling file uploads

    let publicUrl = null;

    // If a file is uploaded, process the image
    if (file) {
      const fileName = `${Date.now()}-${file.originalname}`;
      const { data, error } = await supabase.storage
        .from("Files")
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (error) {
        console.error("Supabase Upload Error:", error.message);
        res.status(500).json({ message: "Failed to upload image." });
        return;
      }

      // Generate public URL for the uploaded file
      const urlResponse = supabase.storage.from("Files").getPublicUrl(fileName);
      publicUrl = urlResponse?.data?.publicUrl;
    }

    // Update user data in the database
    // Replace this section with your database update logic
    const updatedUserData = {
      user_name: username,
      image: publicUrl ?? "",
    };

    const user = await prisma.users.update({
      where: { id: parseInt(req.params.id, 10) },
      data: updatedUserData,
    });

    // Simulate database update
    console.log("User data updated:", user);

    res.status(200).json({
      message: "User data updated successfully.",
      data: user,
    });
  } catch (error) {
    console.error("Error in updateUserData:", "error");
    res.status(500).json({ message: "An unexpected error occurred." });
  }
};

// Configure Multer for File Uploads
// const upload = multer({
//   storage: multer.memoryStorage(), // Store file in memory for direct upload
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
// });

export const resetUserPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies?.[getTokenName(Token.ResetPassword)];
    const { email, password } = req.body;

    if (!token) {
      res.status(400).json({ error: "Missing required Information!" });
      return;
    }

    // Check if email is provided
    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    // Check if the user exists
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (!existingUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, getHashSalt());

    // Update the user with the provided data
    const updatedUser = await prisma.users.update({
      where: { email },
      data: { password: hashedPassword },
    });

    res.clearCookie(getTokenName(Token.ResetPassword), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({ message: "Password Updated!" });
  } catch (err) {
    next(err);
  }
};

export const getChatUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = Number(req.params.id); // Current user ID
  const relationType = req.query.relationType;

  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid User ID!" });
    return;
  }
  try {
    // Fetch user IDs of contacts directly
    const contactUserIds = await prisma.chats.findMany({
      where: {
        members: { has: userId },
      },
      select: {
        members: true,
      },
    });

    // Convert contacts into a Set for faster lookup
    const contactIdsSet = new Set(
      contactUserIds.flatMap((chat) => chat.members.map((userId) => userId))
    );

    let users;

    if (relationType === UserRelationType.CONTACT) {
      // Fetch only contact users
      users = await prisma.users.findMany({
        where: { id: { in: [...contactIdsSet] } },
        select: { id: true, user_name: true, image: true },
      });
    } else if (relationType === UserRelationType.NON_CONTACT) {
      // Directly query users NOT in contacts (excluding self)
      users = await prisma.users.findMany({
        where: {
          AND: [
            { id: { not: userId } }, // Exclude self
            { id: { notIn: [...contactIdsSet] } }, // Exclude contacts
          ],
        },
        select: { id: true, user_name: true, image: true }, // Select only required fields
      });
    } else {
      res.status(400).json({ error: "No relation type provided!" });
    }

    res
      .status(200)
      .json({ message: "Users fetched succesfully!", data: users });
  } catch (error) {
    next(error);
  }
};
