import { z } from "zod";

export const idParamSchema = z.object({
  // Ensures it only contains digits, making it safe to parse later
  id: z.string().regex(/^[1-9]\d*$/, "ID must be a positive integer"),
});

export const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/, "Page must be a positive integer").optional(),
  limit: z
    .string()
    .regex(/^\d+$/, "Limit must be a positive integer")
    .optional(),
});

export const updateUserDataSchema = z.object({
  user_name: z.string().min(1).optional(),
  phone_number: z.string().min(1).optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  image: z.string().optional(),
});

export const updateUserByEmailSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    user_name: z.string().min(1).optional(),
    phone_number: z.string().min(1).optional(),
  })
  .refine((data) => Object.keys(data).length > 1, {
    message: "At least one field to update must be provided",
  });

export const chatUsersQuerySchema = z.object({
  relationType: z.enum(["contacts", "non-contacts"], {
    error: "relationType must be 'contacts' or 'non-contacts'",
  }),
  search: z.string().optional(),
});
