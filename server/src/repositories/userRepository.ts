import { UserRelationType } from "../lib/models";
import prisma from "../lib/prisma";
import {
  RegisterBody,
  UpdateUserDataBody,
  ChatUsersQuery,
} from "../types/requests";

export const PUBLIC_USER_FIELDS = {
  id: true,
  user_name: true,
  email: true,
  phone_number: true,
  gender: true,
  image: true,
} as const;

export const findById = (id: number) =>
  prisma.users.findUnique({
    where: { id },
    select: PUBLIC_USER_FIELDS,
  });

export const findByIdWithPassword = (id: number) =>
  prisma.users.findUnique({ where: { id } });

export const findByEmail = (email: string) =>
  prisma.users.findUnique({ where: { email } });

export const findAll = () =>
  prisma.users.findMany({ select: PUBLIC_USER_FIELDS });

export const insert = (data: RegisterBody, hashedPassword: string) =>
  prisma.users.create({
    data: {
      user_name: data.user_name,
      email: data.email,
      phone_number: data.phone_number,
      gender: data.gender,
      password: hashedPassword,
    },
    select: PUBLIC_USER_FIELDS,
  });

export const updateById = (id: number, data: Partial<UpdateUserDataBody>) =>
  prisma.users.update({
    where: { id },
    data,
    select: PUBLIC_USER_FIELDS,
  });

export const updateByEmail = (email: string, data: Record<string, string>) =>
  prisma.users.update({
    where: { email },
    data,
    select: PUBLIC_USER_FIELDS,
  });

export const updatePassword = (email: string, hashedPassword: string) =>
  prisma.users.update({
    where: { email },
    data: { password: hashedPassword },
    select: { id: true },
  });

export const updateImage = (id: number, imageUrl: string) =>
  prisma.users.update({
    where: { id },
    data: { image: imageUrl },
    select: PUBLIC_USER_FIELDS,
  });

export const deleteById = (id: number) =>
  prisma.users.delete({ where: { id } });

export const findByRelation = (
  userId: number,
  query: ChatUsersQuery,
): Promise<{ id: number; user_name: string; image: string }[]> | null => {
  const { relationType, search } = query;

  const nameFilter = search
    ? { user_name: { contains: search, mode: "insensitive" as const } }
    : {};

  // A contact is someone with whom a private (1-on-1) chat exists
  const privateChatWithUser = {
    chat: {
      isGroupChat: false,
      members: { some: { user_id: userId } },
    },
  };

  if (relationType === UserRelationType.CONTACT) {
    return prisma.users.findMany({
      where: {
        id: { not: userId },
        chats: { some: privateChatWithUser },
        ...nameFilter,
      },
      select: { id: true, user_name: true, image: true },
    });
  }

  if (relationType === UserRelationType.NON_CONTACT) {
    return prisma.users.findMany({
      where: {
        id: { not: userId },
        NOT: { chats: { some: privateChatWithUser } },
        ...nameFilter,
      },
      select: { id: true, user_name: true, image: true },
    });
  }

  return null;
};
