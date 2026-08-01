import { create } from "zustand";
import { AuthCredentials } from "../utils/contracts";
import { AuthAPI } from "../api";
import useUserStore from "./UserStore";
import useChatStore from "./ChatStore";
import useSocketStore from "./SocketStore";
interface AuthStore {
  accessToken: string | null;
  isLoggedIn: boolean;
  loading: boolean;
  isInitialized: boolean;
  pendingRequests: (() => void)[]; // Queue for pending API calls
  initializeAuth: () => Promise<void>;
  resolvePendingRequests: () => void; // Resolve queued requests
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  login: (credentials: AuthCredentials) => Promise<void>;
}

const useAuthStore = create<AuthStore>((set, get) => ({
  accessToken: null,
  isLoggedIn: false,
  loading: true,
  isInitialized: false,
  pendingRequests: [],

  // Initialize authentication on app load
  initializeAuth: async () => {
    try {
      await get().refreshAccessToken(); // Call refresh token method on app load
    } catch (error) {
      set({ isLoggedIn: false });
    } finally {
      set({ isInitialized: true, loading: false });
      get().resolvePendingRequests();
    }

    if (get().accessToken) {
      try {
        await useUserStore.getState().getUserProfile();
      } catch {
        // Profile fetch failed — non-critical, don't block the app
        set({ isLoggedIn: false });
      }
    }
  },

  // Login method
  login: async (credentials: AuthCredentials) => {
    try {
      const response = await AuthAPI.login(credentials);
      set({
        accessToken: response.token,
        isLoggedIn: true,
      });
      useUserStore.setState({ user: response.user });
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
      useUserStore.setState({ user: null });
      useChatStore.getState().clearChats();
      useSocketStore.getState().disconnect();
    } catch (error) {
      throw error;
    }
  },

  // Refresh access token manually if needed
  refreshAccessToken: async () => {
    try {
      const response = await AuthAPI.refreshAccessToken();
      set({ accessToken: response.accessToken, isLoggedIn: true });
    } catch (error) {
      set({ isLoggedIn: false, accessToken: null });
      throw error;
    }
  },

  resolvePendingRequests: () => {
    get().pendingRequests.forEach((resolve) => resolve());
    set({ pendingRequests: [] });
  },
}));

export default useAuthStore;
