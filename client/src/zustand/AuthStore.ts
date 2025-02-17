import { create } from "zustand";
import httpClient from "../api/httpClient";
import { AuthCredentials } from "../utils/contracts";
import { AuthAPI } from "../api";
import useUserStore from "./UserStore";
interface AuthStore {
  accessToken: string | null;
  isLoggedIn: boolean;
  loading: boolean; // Indicates whether the app is initializing

  // Methods
  initializeAuth: () => Promise<void>;
  login: (credentials: AuthCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
}

const useAuthStore = create<AuthStore>((set, get) => ({
  accessToken: null,
  isLoggedIn: false,
  loading: true, // Indicates whether the app is initializing

  // Initialize authentication on app load
  initializeAuth: async () => {
    try {
      await get().refreshAccessToken(); // Call refresh token method on app load
      await useUserStore.getState().getUserProfile();
      set({ loading: false });
    } catch (error) {
      set({ isLoggedIn: false, loading: false });
    }
  },

  // Login method
  login: async (credentials: AuthCredentials) => {
    try {
      const response = await AuthAPI.login(credentials);
      console.log(response.token);
      set({
        accessToken: response.token,
        isLoggedIn: true,
      });
      await useUserStore.getState().getUserProfile();
    } catch (error) {
      throw error;
    }
  },

  // Logout method
  logout: async () => {
    try {
      await AuthAPI.logout();
      set({
        accessToken: null,
        isLoggedIn: false,
      });
    } catch (error) {
      throw error;
    }
  },

  // Refresh access token manually if needed
  refreshAccessToken: async () => {
    try {
      const response = await AuthAPI.refreshAccessToken();
      set({ accessToken: response.data.accessToken, isLoggedIn: true });
    } catch (error) {
      set({ isLoggedIn: false, accessToken: null });
      throw error;
    }
  },
}));

export default useAuthStore;
