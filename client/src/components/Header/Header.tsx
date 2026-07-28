import logo from "../../assets/talkify-logo.svg";
import ThemeToggleButton from "../ThemeToggleButton/ThemeToggleButton";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MessageSquareText, Settings } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useUserStore } from "../../zustand";
import avatarImg from "../../assets/avatar.webp";

export default function Header() {
  const navigate = useNavigate();
  const { user } = useUserStore();

  return (
    <nav className="bg-lightPrimary dark:bg-darkPrimary py-4 px-2 flex flex-col justify-between items-center">
      <div className="flex flex-col justify-center items-center gap-4">
        <img src={logo} alt="Logo Image" className="w-10" />
        <div className="flex flex-col items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="bg-transparent hover:bg-white/10"
            onClick={() => navigate({ to: "/chat" })}
          >
            <MessageSquareText size={20} color="white" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 items-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="bg-transparent hover:bg-white/10"
                onClick={() => navigate({ to: "/settings" })}
              >
                <Settings size={20} color="white" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Settings</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <ThemeToggleButton />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">Toggle Theme</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="bg-transparent hover:bg-white/10 rounded-full p-0"
                onClick={() => navigate({ to: "/profile" })}
              >
                <img
                  src={user?.image ?? avatarImg}
                  alt="Avatar"
                  className="h-8 w-8 rounded-full object-cover"
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Profile</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </nav>
  );
}
