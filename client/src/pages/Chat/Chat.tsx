import logo from "../../assets/logo.png";
import avatarImg from "../../assets/avatar.png";
import { useParams, useNavigate } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import {
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Typography,
} from "@material-tailwind/react";
import ChatListing from "./components/ChatListing/ChatListing";
import ChatDisplay from "./components/ChatDisplay/ChatDisplay";

export default function Chat() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-12 items-stretch h-screen">
      <div className="col-span-3 overflow-auto">
        <ChatListing />
      </div>
      <div className="col-span-9">
        <ChatDisplay />
      </div>
    </div>
  );
}
