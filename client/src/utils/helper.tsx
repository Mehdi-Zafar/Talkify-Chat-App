import toast, { ToastType } from "react-hot-toast";
import { io } from "socket.io-client";

// "undefined" means the URL will be computed from the `window.location` object
const URL = "http://localhost:3000";

export const getSocketInstance = () => {
  const socket = io(URL);
  return socket;
};

// Create a single supabase client for interacting with your database
// export const supabase = createClient(
//   import.meta.env.VITE_SUPABASE_URL,
//   import.meta.env.VITE_SUPABASE_API_KEY
// );

export const showToast = (msg: string, type?: ToastType) => {
  if (type === "success") {
    toast.success(msg, { position: "top-right", duration: 3000 });
  } else if (type === "error") {
    toast.error(msg, { position: "top-right", duration: 3000 });
  } else if (type === "loading") {
    toast.loading(msg, { position: "top-right", duration: 3000 });
  } else {
    toast(msg, { position: "top-right", duration: 3000 });
  }
};

// utils/formatTime.ts

export const formatMessageTime = (date: string | Date): string => {
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true, // ← gives AM/PM format
  });
  // Automatically uses the user's browser timezone
};

export const formatMessageDate = (date: string | Date): string => {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) {
    return "Today";
  } else if (d.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    return d.toLocaleDateString([], {
      day: "numeric",
      month: "short",
      year: "numeric", // e.g. "12 Jan 2025"
    });
  }
};

// src/utils/helper.ts — add this function
export const groupMessagesByDate = <T extends { createdAt: string | Date }>(
  messages: T[],
): { date: string; messages: T[] }[] => {
  const groups: { date: string; messages: T[] }[] = [];

  messages.forEach((message) => {
    const date = formatMessageDate(message.createdAt);
    const lastGroup = groups[groups.length - 1];

    if (lastGroup && lastGroup.date === date) {
      lastGroup.messages.push(message);
    } else {
      groups.push({ date, messages: [message] });
    }
  });

  return groups;
};
