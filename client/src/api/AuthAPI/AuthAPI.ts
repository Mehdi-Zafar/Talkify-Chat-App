import { AuthCredentials, AuthResponse, User } from "../../utils/contracts";
import httpClient from "../httpClient";

export const login = async (credentials: AuthCredentials) => {
  try {
    const res = await httpClient.post<AuthResponse>("/auth/login", credentials);
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const register = async (userData: User) => {
  try {
    const user = new User();
    user.email = userData.email;
    user.user_name = userData.user_name;
    user.gender = userData.gender;
    user.password = userData.password;
    user.phone_number = userData.phone_number;
    const res = await httpClient.post("/auth/register", user);
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    const res = await httpClient.post<AuthResponse>("/auth/logout", {});
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const refreshAccessToken = async () => {
  try {
    const res = await httpClient.post(
      "/auth/refresh-token",
      {},
      { headers: { "hide-toast": true } }
    );
    return res.data;
  } catch (error) {
    throw error;
  }
};
