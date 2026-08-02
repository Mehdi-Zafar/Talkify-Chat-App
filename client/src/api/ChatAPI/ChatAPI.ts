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

// Resets last_read_at in DB for this user+chat — clears persistent unread count
export const markChatAsRead = async (id: number) => {
  try {
    await httpClient.patch(`${BASE_URL}/${id}/read`, null, {
      headers: { "hide-toast": true },
    });
  } catch (error) {
    throw error;
  }
};
