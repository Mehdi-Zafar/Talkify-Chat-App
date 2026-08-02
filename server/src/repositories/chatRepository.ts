import { Prisma } from "@prisma/client";
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
      members: {
        include: {
          user: {
            select: { id: true, user_name: true, email: true, image: true },
          },
        },
      },
    },
  });

export const isMember = (chatId: number, userId: number) =>
  prisma.chat_members.findUnique({
    where: { chat_id_user_id: { chat_id: chatId, user_id: userId } },
  });

export const getMemberIds = async (chatId: number): Promise<number[]> => {
  const rows = await prisma.chat_members.findMany({
    where: { chat_id: chatId },
    select: { user_id: true },
  });
  return rows.map((r) => r.user_id);
};

// Sets last_read_at = now() for the given user in the given chat.
// Called when a user opens a chat — all messages before this point
// are considered read, so unread count resets to 0 on next login.
export const updateLastReadAt = (chatId: number, userId: number) =>
  prisma.chat_members.update({
    where: { chat_id_user_id: { chat_id: chatId, user_id: userId } },
    data: { last_read_at: new Date() },
  });

export const findManyByUserId = (userId: number, page: number, limit: number) =>
  Promise.all([
    prisma.chats.findMany({
      where: { members: { some: { user_id: userId } } },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        members: {
          include: {
            user: { select: { id: true, user_name: true, image: true } },
          },
        },
      },
    }),
    prisma.chats.count({
      where: { members: { some: { user_id: userId } } },
    }),
  ]);

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

export const findMemberDetailsByIds = (memberIds: number[]) =>
  prisma.users.findMany({
    where: { id: { in: memberIds } },
    select: { id: true, user_name: true, image: true },
  });

export const findLastMessagesByChatIds = (chatIds: number[]) =>
  prisma.$queryRaw<
    { chat_id: number; content: string; createdAt: Date; sender_id: number }[]
  >(Prisma.sql`
    SELECT DISTINCT ON (chat_id)
      chat_id,
      content,
      "createdAt",
      sender_id
    FROM messages
    WHERE chat_id = ANY(${chatIds}::int[])
    ORDER BY chat_id, "createdAt" DESC
  `);

// Returns unread message counts for a batch of chats for a given user.
// Unread = messages created after the user's last_read_at for that chat.
// Single query across all chat IDs — no N+1.
export const findUnreadCountsByChatIds = (chatIds: number[], userId: number) =>
  prisma.$queryRaw<{ chat_id: number; unread_count: bigint }[]>(Prisma.sql`
    SELECT
      m.chat_id,
      COUNT(*) AS unread_count
    FROM messages m
    JOIN chat_members cm
      ON cm.chat_id = m.chat_id
      AND cm.user_id = ${userId}
    WHERE
      m.chat_id = ANY(${chatIds}::int[])
      AND m.sender_id != ${userId}
      AND m."createdAt" > cm.last_read_at
    GROUP BY m.chat_id
  `);

export const insert = (data: CreateChatBody, creatorId: number) =>
  prisma.chats.create({
    data: {
      name: data.name ?? "",
      creator_id: creatorId,
      isGroupChat: data.isGroupChat,
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
    prisma.chat_members.deleteMany({ where: { chat_id: id } }),
    prisma.chats.delete({ where: { id } }),
  ]);

export const findMetaById = (id: number) =>
  prisma.chats.findUnique({
    where: { id },
    include: {
      members: {
        include: {
          user: { select: { id: true, user_name: true, image: true } },
        },
      },
    },
  });
