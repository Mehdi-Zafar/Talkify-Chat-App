import { UserRelationType } from "../lib/models";
import prisma from "../lib/prisma";
import {
  RegisterBody,
  UpdateUserDataBody,
  ChatUsersQuery,
} from "../types/requests";

// Single select definition — every query that returns a user uses this.
// Ensures password is never accidentally included in a response.
// When caching is added, cache keys can be derived from this shape.
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

// Includes password — only for auth checks, never sent to client
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

// Finds users that share at least one chat with userId (contacts),
// or all users excluding userId (non-contacts).
// Returns null if relationType is unrecognised — service converts to AppError.
export const findByRelation = (
  userId: number,
  query: ChatUsersQuery,
): Promise<{ id: number; user_name: string; image: string }[]> | null => {
  const { relationType, search } = query;

  const nameFilter = search
    ? { user_name: { contains: search, mode: "insensitive" as const } }
    : {};

  if (relationType === UserRelationType.CONTACT) {
    // Users who share at least one chat with the requesting user
    return prisma.users.findMany({
      where: {
        id: { not: userId },
        messages: {
          some: {
            chat: { members: { has: userId } },
          },
        },
        ...nameFilter,
      },
      select: { id: true, user_name: true, image: true },
    });
  }

  if (relationType === UserRelationType.NON_CONTACT) {
    return prisma.users.findMany({
      where: {
        id: { not: userId },
        NOT: {
          messages: {
            some: {
              chat: { members: { has: userId } },
            },
          },
        },
        ...nameFilter,
      },
      select: { id: true, user_name: true, image: true },
    });
  }

  return null;
};
