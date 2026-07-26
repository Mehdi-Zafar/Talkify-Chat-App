import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  user_name: z.string().min(1, "Username is required"),
  phone_number: z.string().min(1, "Phone number is required"),
  gender: z.enum(["male", "female", "other"], {
    error: "Gender must be male, female, or other",
  }),
});

export const resetPasswordSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
