import axios from "axios";
import { showToast } from "../utils/helper";
import useAuthStore from "@/zustand/AuthStore"; // Import your auth store
import { useUserStore } from "@/zustand";

export const httpClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}`,
  timeout: 10000,
  withCredentials: true,
});

// Flag to prevent multiple token refresh calls
let isRefreshing = false;
// Queue to hold failed requests while token is being refreshed
let failedRequestsQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

httpClient.interceptors.request.use(async (config) => {
  const { isInitialized, pendingRequests, accessToken } =
    useAuthStore.getState();

  console.log(useUserStore.getState().isLoggedIn);
  // Bypass wait if explicitly allowed (e.g., public APIs)
  if (config.headers["allow-before-auth"]) {
    delete config.headers["allow-before-auth"];
    return config;
  }

  // Wait if auth isn't initialized
  if (!isInitialized) {
    await new Promise<void>((resolve) => {
      pendingRequests.push(resolve); // Add to queue
    });
  }

  // Attach token if available
  if (accessToken && !config.headers["no-auth"]) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

httpClient.interceptors.response.use(
  (response) => {
    if (!response.config.headers["hide-toast"]) {
      showToast(response.data.message, "success");
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const { refreshAccessToken, logout } = useAuthStore.getState();

    // Handle 401 Unauthorized (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark request to avoid infinite retry

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          // Attempt to refresh the token
          await refreshAccessToken();
          const newToken = useAuthStore.getState().accessToken;

          if (newToken) {
            // Update the Authorization header
            originalRequest.headers.Authorization = `Bearer ${newToken}`;

            // Resolve all queued requests with the new token
            failedRequestsQueue.forEach((req) => req.resolve(newToken));
            failedRequestsQueue = [];

            // Retry the original request
            return httpClient(originalRequest);
          } else {
            // If no new token, force logout
            await logout();
            window.location.href = "/login";
          }
        } catch (refreshError) {
          // If refresh fails, reject all queued requests
          failedRequestsQueue.forEach((req) => req.reject(refreshError));
          failedRequestsQueue = [];

          // Logout and redirect to login
          await logout();
          window.location.href = "/login";
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        // If token refresh is already in progress, queue the request
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(httpClient(originalRequest));
            },
            reject: (err) => {
              reject(err);
            },
          });
        });
      }
    }

    // Handle other errors (show toast if not explicitly hidden)
    if (!originalRequest?.headers["hide-toast"]) {
      showToast(error?.response?.data?.error || "An error occurred", "error");
    }

    return Promise.reject(error);
  }
);

export default httpClient;
