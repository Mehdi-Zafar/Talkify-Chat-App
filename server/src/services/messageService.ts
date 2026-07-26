import { AppError } from "../errors/AppError";
import * as MessageRepository from "../repositories/messageRepository";
import * as ChatRepository from "../repositories/chatRepository";
import { CreateMessageBody } from "../types/requests";

export const createMessage = async (
  data: CreateMessageBody,
  senderId: number,
) => {
  // findById on the chat (not message) — lightweight check, no messages included
  const chat = await ChatRepository.findById(data.chat_id);
  if (!chat) throw new AppError(404, "Chat not found");
  if (!chat.members.includes(senderId))
    throw new AppError(403, "You are not a member of this chat");
  return MessageRepository.insert(data, senderId);
};

export const getMessages = async (
  chatId: number,
  userId: number,
  page: number,
  limit: number,
) => {
  const chat = await ChatRepository.findById(chatId);
  if (!chat) throw new AppError(404, "Chat not found");
  if (!chat.members.includes(userId))
    throw new AppError(403, "You are not a member of this chat");

  const clampedPage = Math.max(1, page);
  const clampedLimit = Math.min(100, Math.max(1, limit));
  const [messages, total] = await MessageRepository.findManyByChat(
    chatId,
    clampedPage,
    clampedLimit,
  );

  return {
    items: messages,
    total,
    page: clampedPage,
    limit: clampedLimit,
    totalPages: Math.ceil(total / clampedLimit),
  };
};

export const getMessageById = async (id: number, userId: number) => {
  // findById includes chat.members — no second DB call needed
  const message = await MessageRepository.findById(id);
  if (!message) throw new AppError(404, "Message not found");
  if (!message.chat.members.includes(userId))
    throw new AppError(403, "Forbidden");
  return message;
};

export const updateMessage = async (
  id: number,
  userId: number,
  content: string,
) => {
  const message = await MessageRepository.findById(id);
  if (!message) throw new AppError(404, "Message not found");
  if (message.sender_id !== userId)
    throw new AppError(403, "You can only edit your own messages");
  return MessageRepository.updateContent(id, content);
};

export const deleteMessage = async (id: number, userId: number) => {
  const message = await MessageRepository.findById(id);
  if (!message) throw new AppError(404, "Message not found");
  if (message.sender_id !== userId)
    throw new AppError(403, "You can only delete your own messages");
  await MessageRepository.deleteById(id);
};
