import prisma from "../lib/prisma";
import { CreateMessageBody } from "../types/requests";

// Includes chat.members so the service can do the membership check
// without a second DB round trip (fixes double-fetch issue #04)
export const findById = (id: number) =>
  prisma.messages.findUnique({
    where: { id },
    include: {
      chat: { select: { members: true } },
    },
  });

// Paginated messages for a chat — returns [rows, total]
export const findManyByChat = (chatId: number, page: number, limit: number) =>
  Promise.all([
    prisma.messages.findMany({
      where: { chat_id: chatId },
      orderBy: { createdAt: "asc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { id: true, user_name: true, image: true } },
      },
    }),
    prisma.messages.count({ where: { chat_id: chatId } }),
  ]);

export const insert = (data: CreateMessageBody, senderId: number) =>
  prisma.messages.create({
    data: {
      content: data.content,
      chat_id: data.chat_id,
      sender_id: senderId,
    },
    include: {
      user: { select: { id: true, user_name: true, image: true } },
    },
  });

export const updateContent = (id: number, content: string) =>
  prisma.messages.update({
    where: { id },
    data: { content },
  });

export const deleteById = (id: number) =>
  prisma.messages.delete({ where: { id } });
