import logo from "../../assets/talkify-logo.svg";
import avatarImg from "../../assets/avatar.png";
import ThemeToggleButton from "../ThemeToggleButton/ThemeToggleButton";
import { IconButton, Tooltip } from "@material-tailwind/react";
import {
  ChatBubbleBottomCenterTextIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../../zustand";

export default function Header() {
  const navigate = useNavigate();
  const { user } = useUserStore();
  return (
    <nav className="bg-lightPrimary dark:bg-darkPrimary py-4 px-2 flex flex-col justify-between items-center">
      <div className=" flex flex-col justify-center items-center gap-4">
        <img src={logo} alt="Logo Image" className="w-10" />
        <div className="flex flex-col items-center justify-center gap-2">
          <IconButton
            className="bg-transparent"
            onClick={() => navigate("/chat")}
          >
            <ChatBubbleBottomCenterTextIcon width={20} stroke="white" />
          </IconButton>
        </div>
      </div>
      <div className="flex flex-col gap-4 items-center">
        <Tooltip content="Settings" placement="right">
          <IconButton
            className="bg-transparent"
            onClick={() => navigate("/settings")}
          >
            <Cog6ToothIcon width={20} stroke="white" />
          </IconButton>
        </Tooltip>
        <Tooltip content="Toggle Theme" placement="right">
          <ThemeToggleButton />
        </Tooltip>
        <Tooltip content="Profile" placement="right">
          <IconButton
            className="bg-transparent"
            onClick={() => navigate("/profile")}
          >
            <img
              src={user?.image}
              alt="Avatar"
              className="h-8 w-8 rounded-full object-cover"
            />
          </IconButton>
        </Tooltip>
      </div>
    </nav>
  );
}
