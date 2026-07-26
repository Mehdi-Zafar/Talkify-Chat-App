import { z } from "zod";
import { paginationSchema, idParamSchema } from "./userValidators";

export { idParamSchema, paginationSchema };

export const createChatSchema = z
  .object({
    name: z.string().min(1).optional(),
    members: z
      .array(z.number().int().positive())
      .min(1, "At least one member is required"),
    isGroupChat: z.boolean({
      error: "isGroupChat must be a boolean",
    }),
  })
  .refine((data) => !data.isGroupChat || !!data.name, {
    message: "Group chat must have a name",
    path: ["name"],
  });

export const updateChatSchema = z
  .object({
    name: z.string().min(1).optional(),
    members: z.array(z.number().int().positive()).optional(),
  })
  .refine((data) => data.name !== undefined || data.members !== undefined, {
    message: "At least one field to update must be provided",
  });
