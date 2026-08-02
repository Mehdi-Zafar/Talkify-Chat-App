import { AppError } from "../errors/AppError";
import * as ChatRepository from "../repositories/chatRepository";
import * as MessageRepository from "../repositories/messageRepository";
import { CreateChatBody, UpdateChatBody } from "../types/requests";

export const createChat = async (data: CreateChatBody, creatorId: number) => {
  if (data.isGroupChat === true) {
    const members = data.members.includes(creatorId)
      ? data.members
      : [...data.members, creatorId];
    return ChatRepository.insert(
      { name: data.name, isGroupChat: true, members },
      creatorId,
    );
  }

  if (data.isGroupChat === false) {
    return ChatRepository.insert(
      { name: "", isGroupChat: false, members: [data.member_id, creatorId] },
      creatorId,
    );
  }
};

export const getChats = async (userId: number, page: number, limit: number) => {
  const clampedPage = Math.max(1, page);
  const clampedLimit = Math.min(100, Math.max(1, limit));
  const [chats, total] = await ChatRepository.findManyPaginated(
    userId,
    clampedPage,
    clampedLimit,
  );
  return {
    items: chats,
    total,
    page: clampedPage,
    limit: clampedLimit,
    totalPages: Math.ceil(total / clampedLimit),
  };
};

export const getChatById = async (chatId: number, userId: number) => {
  const chat = await ChatRepository.findWithMessages(chatId);
  if (!chat) throw new AppError(404, "Chat not found");

  const isMember = chat.members.some((m) => m.user_id === userId);
  if (!isMember) throw new AppError(403, "You are not a member of this chat");

  return {
    id: chat.id,
    name: chat.name,
    isGroupChat: chat.isGroupChat,
    creatorId: chat.creator_id,
    members: chat.members.map((m) => ({
      id: m.user.id,
      user_name: m.user.user_name,
      email: m.user.email,
      image: m.user.image,
    })),
    messages: chat.messages.map((m) => ({
      id: m.id,
      content: m.content,
      attachments: m.attachments,
      createdAt: m.createdAt,
      sender: { id: m.user.id, name: m.user.user_name, image: m.user.image },
    })),
  };
};

export const getChatMessages = async (
  chatId: number,
  userId: number,
  page: number,
  limit: number,
) => {
  const membership = await ChatRepository.isMember(chatId, userId);
  if (!membership) throw new AppError(403, "You are not a member of this chat");

  const clampedPage = Math.max(1, page);
  const clampedLimit = Math.min(100, Math.max(1, limit));

  const [messages, total] = await MessageRepository.findManyByChat(
    chatId,
    clampedPage,
    clampedLimit,
  );

  return {
    items: messages.map((m) => ({
      id: m.id,
      content: m.content,
      attachments: m.attachments,
      createdAt: m.createdAt,
      sender: { id: m.user.id, name: m.user.user_name, image: m.user.image },
    })),
    total,
    page: clampedPage,
    limit: clampedLimit,
    totalPages: Math.ceil(total / clampedLimit),
  };
};

export const getChatsByUserId = async (
  userId: number,
  requesterId: number,
  page: number,
  limit: number,
) => {
  if (userId !== requesterId) throw new AppError(403, "Forbidden");

  const clampedPage = Math.max(1, page);
  const clampedLimit = Math.min(50, Math.max(1, limit));

  const [chats, total] = await ChatRepository.findManyByUserId(
    userId,
    clampedPage,
    clampedLimit,
  );

  if (chats.length === 0) {
    return {
      items: [],
      total: 0,
      page: clampedPage,
      limit: clampedLimit,
      totalPages: 0,
    };
  }

  const chatIds = chats.map((c) => c.id);

  // Both queries run in parallel — no sequential waiting
  const [lastMessages, unreadRows] = await Promise.all([
    ChatRepository.findLastMessagesByChatIds(chatIds),
    ChatRepository.findUnreadCountsByChatIds(chatIds, userId),
  ]);

  const lastMessageMap = new Map(lastMessages.map((m) => [m.chat_id, m]));
  // $queryRaw returns bigint for COUNT — convert to number
  const unreadMap = new Map(
    unreadRows.map((r) => [r.chat_id, Number(r.unread_count)]),
  );

  const items = chats.map((chat) => {
    const memberDetails = chat.members.map((m) => ({
      id: m.user.id,
      user_name: m.user.user_name,
      image: m.user.image,
    }));

    let name = chat.name;
    if (!chat.isGroupChat && !name) {
      const other = memberDetails.find((m) => m.id !== userId);
      name = other?.user_name ?? "Chat";
    }

    const lastMessage = lastMessageMap.get(chat.id);

    return {
      id: chat.id,
      name,
      isGroupChat: chat.isGroupChat,
      creator_id: chat.creator_id,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      memberDetails,
      lastMessage: lastMessage
        ? {
            content: lastMessage.content,
            createdAt: lastMessage.createdAt,
            isOwn: lastMessage.sender_id === userId,
          }
        : null,
      unreadCount: unreadMap.get(chat.id) ?? 0,
    };
  });

  return {
    items,
    total,
    page: clampedPage,
    limit: clampedLimit,
    totalPages: Math.ceil(total / clampedLimit),
  };
};

export const updateChat = async (
  chatId: number,
  requesterId: number,
  data: UpdateChatBody,
) => {
  const chat = await ChatRepository.findById(chatId);
  if (!chat) throw new AppError(404, "Chat not found");
  if (chat.creator_id !== requesterId)
    throw new AppError(403, "Only the chat creator can update it");
  return ChatRepository.updateById(chatId, data);
};

export const deleteChat = async (chatId: number, requesterId: number) => {
  const chat = await ChatRepository.findById(chatId);
  if (!chat) throw new AppError(404, "Chat not found");
  if (chat.creator_id !== requesterId)
    throw new AppError(403, "Only the chat creator can delete it");
  await ChatRepository.deleteById(chatId);
};

// Sets last_read_at = now() — resets persistent unread count for this user in this chat
export const markAsRead = async (chatId: number, userId: number) => {
  const membership = await ChatRepository.isMember(chatId, userId);
  if (!membership) throw new AppError(403, "You are not a member of this chat");
  await ChatRepository.updateLastReadAt(chatId, userId);
};

export const getChatMeta = async (chatId: number, requesterId: number) => {
  const membership = await ChatRepository.isMember(chatId, requesterId);
  if (!membership) throw new AppError(403, "You are not a member of this chat");

  const chat = await ChatRepository.findMetaById(chatId);
  if (!chat) throw new AppError(404, "Chat not found");

  return {
    id: chat.id,
    name: chat.name,
    isGroupChat: chat.isGroupChat,
    creator_id: chat.creator_id,
    createdAt: chat.createdAt,
    updatedAt: chat.updatedAt,
    memberDetails: chat.members.map((m) => ({
      id: m.user.id,
      user_name: m.user.user_name,
      image: m.user.image,
    })),
  };
};
