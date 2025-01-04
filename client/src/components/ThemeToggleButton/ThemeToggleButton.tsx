import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { Theme } from "../../utils/contracts";
import { useThemeStore } from "../../zustand";
import { IconButton } from "@material-tailwind/react";

const ThemeToggleButton = () => {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <IconButton
      onClick={toggleTheme}
      className="px-4 py-2 rounded bg-transparent"
    >
      {theme === Theme.LIGHT ? (
        <SunIcon stroke="white" width={20} />
      ) : (
        <MoonIcon stroke="white" width={20} />
      )}
    </IconButton>
  );
};

export default ThemeToggleButton;
