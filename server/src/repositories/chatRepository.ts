import prisma from "../lib/prisma";
import { CreateChatBody, UpdateChatBody } from "../types/requests";

export const findById = (id: number) =>
  prisma.chats.findUnique({ where: { id } });

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
      // Include members relation so service can read member list
      members: {
        select: { user_id: true },
      },
    },
  });

// Dedicated membership check — single indexed lookup on composite PK
// Cheaper than fetching all members just to call .includes()
export const isMember = (chatId: number, userId: number) =>
  prisma.chat_members.findUnique({
    where: { chat_id_user_id: { chat_id: chatId, user_id: userId } },
  });

export const findManyByUserId = (userId: number) =>
  prisma.chats.findMany({
    where: { members: { some: { user_id: userId } } },
    orderBy: { updatedAt: "desc" },
    include: { members: { select: { user_id: true } } },
  });

export const findManyPaginated = (
  userId: number,
  page: number,
  limit: number,
) =>
  Promise.all([
    prisma.chats.findMany({
      where: { members: { some: { user_id: userId } } },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.chats.count({ where: { members: { some: { user_id: userId } } } }),
  ]);

export const findMembersByIds = (memberIds: number[]) =>
  prisma.users.findMany({
    where: { id: { in: memberIds } },
    select: { id: true, user_name: true, email: true, image: true },
  });

export const findMemberDetailsByIds = (memberIds: number[]) =>
  prisma.users.findMany({
    where: { id: { in: memberIds } },
    select: { id: true, user_name: true, image: true },
  });

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
      creator_id: creatorId,
      isGroupChat: data.isGroupChat,
      // members is now a relation — nested create into chat_members
      members: {
        create: data.members.map((userId) => ({ user_id: userId })),
      },
    },
  });

export const updateById = (id: number, data: UpdateChatBody) =>
  prisma.chats.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      // members update: replace all existing members
      ...(data.members !== undefined && {
        members: {
          deleteMany: {},
          create: data.members.map((userId) => ({ user_id: userId })),
        },
      }),
    },
  });

export const deleteById = (id: number) =>
  prisma.$transaction([
    prisma.messages.deleteMany({ where: { chat_id: id } }),
    // chat_members rows are deleted before chats due to FK
    prisma.chat_members.deleteMany({ where: { chat_id: id } }),
    prisma.chats.delete({ where: { id } }),
  ]);
