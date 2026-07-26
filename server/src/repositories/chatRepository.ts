import prisma from "../lib/prisma";
import { CreateChatBody, UpdateChatBody } from "../types/requests";

export const findById = (id: number) =>
  prisma.chats.findUnique({ where: { id } });

// Includes messages + sender info for the getChatById response.
// Also selects `members` on the chat so the service can do the
// membership check on the already-fetched object — no second round trip.
export const findWithMessages = (id: number) =>
  prisma.chats.findUnique({
    where: { id },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        take: 50,
        include: {
          user: { select: { id: true, user_name: true, image: true } },
        },
      },
    },
  });

export const findManyByUserId = (userId: number) =>
  prisma.chats.findMany({
    where: { members: { has: userId } },
    orderBy: { updatedAt: "desc" },
  });

// Paginated list of chats — returns [rows, total] for pagination metadata
export const findManyPaginated = (
  userId: number,
  page: number,
  limit: number,
) =>
  Promise.all([
    prisma.chats.findMany({
      where: { members: { has: userId } },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.chats.count({ where: { members: { has: userId } } }),
  ]);

// Fetch full user records for a set of member IDs
export const findMembersByIds = (memberIds: number[]) =>
  prisma.users.findMany({
    where: { id: { in: memberIds } },
    select: { id: true, user_name: true, email: true, image: true },
  });

// Lightweight member details for the chat list (no email needed)
export const findMemberDetailsByIds = (memberIds: number[]) =>
  prisma.users.findMany({
    where: { id: { in: memberIds } },
    select: { id: true, user_name: true, image: true },
  });

// One last message per chat — used to populate the chat list preview
export const findLastMessagesByChatIds = (chatIds: number[]) =>
  prisma.messages.findMany({
    where: { chat_id: { in: chatIds } },
    orderBy: { createdAt: "desc" },
    distinct: ["chat_id"],
    select: { chat_id: true, content: true, createdAt: true, sender_id: true },
  });

export const insert = (data: CreateChatBody, creatorId: number) =>
  prisma.chats.create({
    data: {
      name: data.name ?? "",
      members: data.members,
      creator_id: creatorId,
      isGroupChat: data.isGroupChat,
    },
  });

export const updateById = (id: number, data: UpdateChatBody) =>
  prisma.chats.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.members !== undefined && { members: data.members }),
    },
  });

// Transaction: delete messages first (FK), then the chat
export const deleteById = (id: number) =>
  prisma.$transaction([
    prisma.messages.deleteMany({ where: { chat_id: id } }),
    prisma.chats.delete({ where: { id } }),
  ]);
