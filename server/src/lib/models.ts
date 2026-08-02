import { Prisma } from "@prisma/client";
import { PUBLIC_USER_FIELDS } from "../repositories/userRepository";

export enum Purpose {
  SignUp = "signUp",
  ResetPassword = "resetPassword",
}

export enum Token {
  RefreshToken = "refreshToken",
  ResetPassword = "resetPassword",
}

export enum UserRelationType {
  CONTACT = "contact",
  NON_CONTACT = "non-contact",
}

export enum SocketEvent {
  CONNECT = "connect",
  DISCONNECT = "disconnect",
  SEND_MSG = "sendMsg",
  RECEIVE_MSG = "receiveMsg",
  CONNECT_ERROR = "connectError",
  MSG_SENT = "msg_sent",
}

export type PublicUser = Prisma.usersGetPayload<{
  select: typeof PUBLIC_USER_FIELDS;
}>;
