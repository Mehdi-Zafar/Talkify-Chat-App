import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { useAuthStore, useThemeStore } from "./zustand";
import { useEffect, useLayoutEffect } from "react";
import { Theme } from "./utils/contracts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  const { theme } = useThemeStore();
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    const root = window.document.documentElement;

    if (theme === Theme.DARK) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  useLayoutEffect(() => {
    initializeAuth();
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router}></RouterProvider>
    </QueryClientProvider>
  );
}

export default App;
