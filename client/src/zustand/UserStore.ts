import { create } from "zustand";
import httpClient from "../api/httpClient"; // Axios instance with interceptors
import { User } from "../utils/contracts"; // Assuming you have a User interface defined
import { UsersAPI } from "../api";

interface UsersStore {
  user: User | null; // User object or null if not logged in
  isLoading: boolean; // Indicates whether user data is loading
  isLoggedIn: boolean; // Indicates login status
  error: string | null; // Error messages if any
  getUserProfile: () => Promise<void>;
}

const useUserStore = create<UsersStore>((set) => ({
  user: null,
  isLoading: false,
  isLoggedIn: false,
  error: null,

  getUserProfile: async () => {
    const res = await UsersAPI.getUserProfile();
    set({
      user: res.data,
    });
  },
}));

export default useUserStore;
