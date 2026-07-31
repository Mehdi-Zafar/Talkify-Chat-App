import { AppError } from "../errors/AppError";
import * as ChatRepository from "../repositories/chatRepository";
import { CreateChatBody, UpdateChatBody } from "../types/requests";

export const createChat = async (data: CreateChatBody, creatorId: number) => {
  const members = data.members.includes(creatorId)
    ? data.members
    : [...data.members, creatorId];

  return ChatRepository.insert({ ...data, members }, creatorId);
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

  // members is now chat_members[] — extract user_ids for the membership check
  const memberIds = chat.members.map((m) => m.user_id);
  if (!memberIds.includes(userId))
    throw new AppError(403, "You are not a member of this chat");

  const members = await ChatRepository.findMembersByIds(memberIds);

  return {
    id: chat.id,
    name: chat.name,
    isGroupChat: chat.isGroupChat,
    creatorId: chat.creator_id,
    members,
    messages: chat.messages.map((m) => ({
      id: m.id,
      content: m.content,
      attachments: m.attachments,
      createdAt: m.createdAt,
      sender: { id: m.user.id, name: m.user.user_name, image: m.user.image },
    })),
  };
};

export const getChatsByUserId = async (userId: number, requesterId: number) => {
  if (userId !== requesterId) throw new AppError(403, "Forbidden");

  const chats = await ChatRepository.findManyByUserId(userId);
  if (chats.length === 0) return [];

  const chatIds = chats.map((c) => c.id);

  // members is chat_members[] — extract unique user_ids across all chats
  const uniqueMemberIds = [
    ...new Set(chats.flatMap((c) => c.members.map((m) => m.user_id))),
  ];

  const [memberDetails, lastMessages] = await Promise.all([
    ChatRepository.findMemberDetailsByIds(uniqueMemberIds),
    ChatRepository.findLastMessagesByChatIds(chatIds),
  ]);

  const membersMap = new Map(memberDetails.map((m) => [m.id, m]));
  const lastMessageMap = new Map(lastMessages.map((m) => [m.chat_id, m]));

  return chats.map((chat) => {
    // Extract IDs from junction rows, then look up full details from map
    const populatedMembers = chat.members
      .map((m) => membersMap.get(m.user_id))
      .filter(
        (m): m is { id: number; user_name: string; image: string } =>
          m !== undefined,
      );

    let name = chat.name;
    if (!chat.isGroupChat && !name) {
      const other = populatedMembers.find((m) => m.id !== userId);
      name = other?.user_name ?? "Chat";
    }

    const lastMessage = lastMessageMap.get(chat.id);
    return {
      ...chat,
      name,
      memberDetails: populatedMembers,
      lastMessage: lastMessage
        ? {
            content: lastMessage.content,
            createdAt: lastMessage.createdAt,
            isOwn: lastMessage.sender_id === userId,
          }
        : null,
    };
  });
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
