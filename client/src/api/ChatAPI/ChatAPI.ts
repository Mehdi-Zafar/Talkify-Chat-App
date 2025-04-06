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

export const getChatsByUserId = async (id: number) => {
  try {
    const res = await httpClient.get(`${BASE_URL}/user/${id}`, {
      headers: { "hide-toast": true },
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const getChatsByChatId = async (id: number): Promise<Chat> => {
  try {
    const res = await httpClient.get(`${BASE_URL}/${id}`, {
      headers: { "hide-toast": true },
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};
