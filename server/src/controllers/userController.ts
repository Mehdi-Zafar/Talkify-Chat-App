import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "..";

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

export const updateUser = async (
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
