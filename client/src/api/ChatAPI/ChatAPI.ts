import { Chat } from "../../utils/contracts";
import httpClient from "../httpClient";

const BASE_URL = "/chats";

export const createGroupChat = async (chat: Chat) => {
  try {
    const res = await httpClient.post(`${BASE_URL}`, chat, {
      headers: { "hide-toast": true },
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

// Paginated chat list — called by useInfiniteQuery in the chat list component
export const getChatsByUserId = async (
  id: number,
  page: number,
  limit: number,
) => {
  try {
    const res = await httpClient.get(`${BASE_URL}/user/${id}`, {
      params: { page, limit },
      headers: { "hide-toast": true },
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

// Lightweight metadata fetch — only called when store doesn't have this chat
// (refresh case or chat outside currently loaded list pages)
export const getChatMeta = async (id: number) => {
  try {
    const res = await httpClient.get(`${BASE_URL}/${id}/meta`, {
      headers: { "hide-toast": true },
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

// Paginated messages for a specific chat
export const getChatMessages = async (
  id: number,
  page: number,
  limit: number,
) => {
  try {
    const res = await httpClient.get(`${BASE_URL}/${id}/messages`, {
      params: { page, limit },
      headers: { "hide-toast": true },
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};
