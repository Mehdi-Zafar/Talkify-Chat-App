import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { SocketEvent } from "../lib/models";
import { verifyAccessToken } from "../lib/jwt";
import * as MessageService from "../services/messageService";
import * as ChatRepository from "../repositories/chatRepository";

interface IncomingMessage {
  chat_id: number;
  content: string;
  attachments?: string[];
  sender: {
    id: number;
    image: string;
  };
  createdAt: string;
}

export const registerSocketHandlers = (io: Server) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Unauthorized"));
    try {
      const payload = verifyAccessToken(token);
      socket.data.userId = payload.id;
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return next(new Error("TOKEN_EXPIRED"));
      }
      return next(new Error("TOKEN_INVALID"));
    }
  });

  io.on(SocketEvent.CONNECT, (socket: Socket) => {
    const userId: number = socket.data.userId;

    // Each user joins a personal room named after their ID.
    // All messages addressed to this user are delivered here,
    // regardless of which chat they currently have open.
    socket.join(`user:${userId}`);
    console.log(`User ${userId} connected: ${socket.id}`);

    socket.on(SocketEvent.SEND_MSG, async (data: IncomingMessage) => {
      try {
        const saved = await MessageService.createMessage(
          {
            chat_id: data.chat_id,
            content: data.content,
            attachments: data.attachments ?? [],
          },
          userId, // from verified JWT — never trust client's sender.id
        );

        // Get all member IDs for this chat from DB
        const memberIds = await ChatRepository.getMemberIds(data.chat_id);

        // Emit to each member's personal room, skipping the sender.
        // Sender already has the message via manual state insert on the client.
        for (const memberId of memberIds) {
          if (memberId === userId) continue;
          io.to(`user:${memberId}`).emit(SocketEvent.RECEIVE_MSG, {
            ...saved,
            sender: data.sender,
          });
        }
      } catch (error) {
        console.error("Failed to save message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    socket.on(SocketEvent.DISCONNECT, () => {
      console.log(`User ${userId} disconnected: ${socket.id}`);
    });
  });
};
