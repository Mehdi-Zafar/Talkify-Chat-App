import { ResetPasswordPayload, UserRelationType } from "../../utils/contracts";
import httpClient from "../httpClient";

const BASE_URL = "/users";

export const getUsers = async () => {
  try {
    const res = await httpClient.get(`${BASE_URL}`, {
      headers: { "hide-toast": true },
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const getUserProfile = async () => {
  try {
    const res = await httpClient.get(`${BASE_URL}/get/profile`, {
      headers: { "hide-toast": true },
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const updateUserByEmail = async (data) => {
  try {
    const res = await httpClient.put(`${BASE_URL}`, data);
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const updateUserData = async (userData, id) => {
  try {
    const formData = new FormData();
    formData.append("image", userData?.image); // Replace `selectedFile` with the actual file object
    formData.append("username", userData?.username);
    formData.append("about", userData?.about);
    const res = await httpClient.post(
      `${BASE_URL}/upload-user-data/${id}`,
      formData
    );
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (payload: ResetPasswordPayload) => {
  try {
    const res = await httpClient.post(`${BASE_URL}/reset-password`, payload);
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const getChatUsers = async (
  userId: number,
  relationType: UserRelationType
) => {
  try {
    const res = await httpClient.get(
      `${BASE_URL}/chat/${userId}?relationType=${relationType}`
    );
    return res.data;
  } catch (error) {
    throw error;
  }
};
