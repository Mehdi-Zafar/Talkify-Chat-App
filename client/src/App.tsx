import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { useThemeStore } from "./zustand";
import { useEffect } from "react";
import { Theme } from "./utils/contracts";

function App() {
  const { theme } = useThemeStore();

  useEffect(() => {
    const root = window.document.documentElement;

    if (theme === Theme.DARK) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);
  return <RouterProvider router={router}></RouterProvider>;
}

export default App;
