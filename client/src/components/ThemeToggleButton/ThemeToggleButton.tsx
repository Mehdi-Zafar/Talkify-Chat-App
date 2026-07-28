import { MoonIcon, SunIcon } from "lucide-react";
import { Theme } from "../../utils/contracts";
import { useThemeStore } from "../../zustand";
import { Button } from "@/components/ui/button";

const ThemeToggleButton = ({ header = false }) => {
  const { theme, toggleTheme } = useThemeStore();

  const icon =
    theme === Theme.LIGHT ? (
      <SunIcon width={20} stroke="white" />
    ) : (
      <MoonIcon width={20} stroke="white" />
    );

  if (header) {
    return (
      <div className="group fixed bottom-0 right-0 p-2 flex items-end justify-end w-24 h-24">
        <Button
          size="icon"
          onClick={toggleTheme}
          className="rounded-full bg-lightPrimary hover:bg-lightPrimary/90"
        >
          {icon}
        </Button>
      </div>
    );
  }

  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={toggleTheme}
      className="bg-transparent hover:bg-white/10"
    >
      {icon}
    </Button>
  );
};

export default ThemeToggleButton;
