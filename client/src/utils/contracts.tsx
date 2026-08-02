export enum Theme {
  LIGHT = "light",
  DARK = "dark",
}

export class User {
  id: number;
  user_name: string;
  email: string;
  phone_number: string;
  gender: string;
  password: string;
  verification_code: string;
  verification_code_expiry: number;
  image: string;
}

export class Chat {
  id: number;
  name: string | null;
  members: number[];
  creator_id: number;
  isGroupChat: boolean;
  memberDetails?: User[];
  messages: Message[];
  updatedAt: string;
  lastMessage?: {
    content: string;
    createdAt: Date;
    isOwn: boolean;
  } | null;
}

export class CreateGroupChatRequest {
  name: string = "";
  isGroupChat: boolean = true;
  members: number[] = [];
}

export class CreateChatRequest {
  member_id: number = 0;
  isGroupChat: boolean = false;
}

export class Message {
  id: number;
  content: string;
  attachments: string[];
  sender: User;
  chat_id: number;
  createdAt: string;
}

export class AuthCredentials {
  email: string;
  password: string;
}

export class AuthResponse {
  token: string;
  user: User;
}

export class OtpRequest {
  email: string;
}

export class OtpVerifyRequest {
  email: string;
  otp: string;
  purpose: Purpose;
}

export class OtpResponse {
  message: string;
  timeout: number;
}

export enum Purpose {
  SignUp = "signUp",
  ResetPassword = "resetPassword",
}

export class ResetPasswordPayload {
  email: string;
  password: string;
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
}

export interface ChatMeta {
  id: number;
  name: string;
  isGroupChat: boolean;
  memberDetails: { id: number; user_name: string; image: string }[];
  lastMessage: {
    content: string;
    createdAt: string;
    isOwn: boolean;
  } | null;
  updatedAt: string;
  unreadCount: number;
}
