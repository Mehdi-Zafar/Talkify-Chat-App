import logo from "../../assets/talkify-logo.svg";
import avatarImg from "../../assets/avatar.png";
import ThemeToggleButton from "../ThemeToggleButton/ThemeToggleButton";
import { Tooltip } from "@material-tailwind/react";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";

export default function Header() {
  return (
    <nav className="bg-lightPrimary dark:bg-darkPrimary py-4 px-2 flex flex-col justify-between items-center">
      <div className=" flex justify-center items-center">
        <img src={logo} alt="Logo Image" className="w-10" />
      </div>
      <div className="flex flex-col gap-4 items-center">
        <Tooltip content="Settings" placement="right">
          <Cog6ToothIcon width={20} stroke="white" />
        </Tooltip>
        <Tooltip content="Toggle Theme" placement="right">
          <ThemeToggleButton />
        </Tooltip>
        <Tooltip content="Profile" placement="right">
          <img
            src={avatarImg}
            alt="Avatar"
            className="h-8 w-8 rounded-full object-cover"
          />
        </Tooltip>
      </div>
    </nav>
  );
}
