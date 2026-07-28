import { useThemeStore } from "@/zustand";
import { Toaster } from "../ui/sonner";

export default function ToasterWithTheme() {
  const { theme } = useThemeStore();
  return <Toaster position="top-right" richColors theme={theme} />;
}
