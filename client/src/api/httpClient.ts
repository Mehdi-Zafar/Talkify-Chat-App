import axios from "axios";
import { showToast } from "../utils/helper";

export const httpClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}`,
  timeout: 10000,
  withCredentials: true,
});

httpClient.interceptors.request.use(
  (config) => {
    // const token = AuthManager.getAccessToken();

    // if (token && !config.headers["no-auth"]) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }

    delete config.headers["no-auth"];

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

httpClient.interceptors.response.use(
  (response) => {
    if (!response.config.headers["hide-toast"]) {
      showToast(response.data.message, "success");
    }
    return response;
  },
  (error) => {
    const config = error.config;
    console.log(error);
    // Check if the showToast header is set in the request config
    if (!config?.headers["hide-toast"]) {
      // if (error.response) {
      //   window.location.href = '/login';
      // }
      showToast(error?.response?.data?.error || "An Error occurred", "error");
    }
    return Promise.reject(error);
  }
);

export default httpClient;
