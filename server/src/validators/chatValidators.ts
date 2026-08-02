import { z } from "zod";
import { paginationSchema, idParamSchema } from "./userValidators";

export { idParamSchema, paginationSchema };

export const createChatSchema = z.discriminatedUnion("isGroupChat", [
  // Private chat
  z.object({
    isGroupChat: z.literal(false),
    member_id: z.number().int().positive(),
  }),
  // Group chat
  z.object({
    isGroupChat: z.literal(true),
    name: z.string().min(1, "Group name is required"),
    members: z
      .array(z.number().int().positive())
      .min(2, "Group chat must have at least 2 members"),
  }),
]);

export const updateChatSchema = z
  .object({
    name: z.string().min(1).optional(),
    members: z.array(z.number().int().positive()).optional(),
  })
  .refine((data) => data.name !== undefined || data.members !== undefined, {
    message: "At least one field to update must be provided",
  });
