import { z } from "zod";
import { paginationSchema } from "./userValidators";

export { paginationSchema };

export const createMessageSchema = z.object({
  content: z.string().min(1, "Message content cannot be empty"),
  chat_id: z.number().int().positive("Invalid chat ID"),
  attachments: z.array(z.string().url()).optional(),
});

export const updateMessageSchema = z.object({
  content: z.string().min(1, "Message content cannot be empty"),
});

export const chatIdParamSchema = z.object({
  chatId: z.coerce.number().int().positive("Invalid chat ID"),
});
