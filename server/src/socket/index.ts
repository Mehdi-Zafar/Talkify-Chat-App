// src/socket/index.ts
import { Server, Socket } from "socket.io";
import prisma from "../lib/prisma";
import { Message, SocketEvent } from "../lib/models";

export const registerSocketHandlers = (io: Server) => {
  io.on(SocketEvent.CONNECT, (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on(SocketEvent.JOIN_CHAT, (chatId) => {
      socket.join(chatId.toString());
    });

    socket.on(SocketEvent.SEND_MSG, async (data: Message) => {
      try {
        await prisma.messages.create({
          data: {
            content: data.content,
            sender_id: data.sender.id,
            chat_id: data.chat_id,
          },
        });
        socket.to(data.chat_id.toString()).emit(SocketEvent.RECEIVE_MSG, data);
      } catch (error) {
        console.error("Failed to save message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    socket.on(SocketEvent.DISCONNECT, () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};
