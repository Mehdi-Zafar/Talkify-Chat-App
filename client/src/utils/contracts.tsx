export enum Theme {
  LIGHT = "light",
  DARK = "dark",
}

// models/User.ts
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
  name: string;
  members: number[];
  creator_id: number;
  isGroupChat: boolean;
}

export class Message {
  id: number;
  content: string;
  attachments: string[];
  sender_id: number;
  chat_id: number;
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
}

export class OtpResponse {
  message: string;
  success: boolean;
}
