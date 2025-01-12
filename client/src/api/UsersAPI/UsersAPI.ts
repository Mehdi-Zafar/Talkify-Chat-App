import httpClient from "../httpClient";

export const getUserProfile = async () => {
  try {
    const res = await httpClient.get("/users/get/profile", {
      headers: { "hide-toast": true },
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};
