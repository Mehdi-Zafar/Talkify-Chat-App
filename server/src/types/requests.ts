import { z } from "zod";
import {
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "../validators/authValidators";
import { sendOtpSchema, verifyOtpSchema } from "../validators/otpValidators";
import {
  idParamSchema,
  paginationSchema,
  updateUserDataSchema,
  updateUserByEmailSchema,
  chatUsersQuerySchema,
} from "../validators/userValidators";
import {
  createChatSchema,
  updateChatSchema,
} from "../validators/chatValidators";
import {
  createMessageSchema,
  updateMessageSchema,
  chatIdParamSchema,
} from "../validators/messageValidators";
import { Request } from "express";

// Auth
export type LoginBody = z.infer<typeof loginSchema>;
export type RegisterBody = z.infer<typeof registerSchema>;

// OTP
export type SendOtpBody = z.infer<typeof sendOtpSchema>;
export type VerifyOtpBody = z.infer<typeof verifyOtpSchema>;

// User
export type UpdateUserDataBody = z.infer<typeof updateUserDataSchema>;
export type UpdateUserByEmailBody = z.infer<typeof updateUserByEmailSchema>;
export type ResetPasswordBody = z.infer<typeof resetPasswordSchema>;
export type ChatUsersQuery = z.infer<typeof chatUsersQuerySchema>;

// Chat
export type CreateChatBody = z.infer<typeof createChatSchema>;
export type UpdateChatBody = z.infer<typeof updateChatSchema>;

// Message
export type CreateMessageBody = z.infer<typeof createMessageSchema>;
export type UpdateMessageBody = z.infer<typeof updateMessageSchema>;

// Shared
export type IdParam = z.infer<typeof idParamSchema>;
export type ChatIdParam = z.infer<typeof chatIdParamSchema>;
export type PaginationQuery = z.infer<typeof paginationSchema>;

export interface ValidatedRequest<
  TParams = {},
  TBody = {},
  TQuery = {},
> extends Request {
  params: TParams & Request["params"];
  body: TBody;
  query: TQuery & Request["query"];
}
