import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router";
import { useAuthStore, useThemeStore } from "./zustand";
import { useEffect, useLayoutEffect } from "react";
import { Theme } from "./utils/contracts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import queryClient from "./lib/queryClient";

function App() {
  const theme = useThemeStore((state) => state.theme);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

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
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
