import avatarImg from "@/assets/avatar.webp";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { EllipsisVerticalIcon } from "lucide-react";

interface ChatHeaderProps {
  chatMeta: { name?: string; image?: string } | undefined;
}

export default function ChatHeader({ chatMeta }: ChatHeaderProps) {
  return (
    <div className="w-full flex justify-between items-center py-3 px-4 border-gray-50 dark:border-darkBg border-y bg-lightBg dark:bg-darkBg">
      <div className="flex gap-3 items-center">
        <img
          src={avatarImg}
          alt="Avatar"
          className="h-10 w-10 rounded-full object-cover"
        />
        <h3 className="text-sm font-semibold text-lightText dark:text-darkText">
          {chatMeta?.name ?? "Loading..."}
        </h3>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button>
            <EllipsisVerticalIcon
              width={25}
              className="text-lightText dark:text-darkText cursor-pointer"
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-lightBg dark:bg-darkBg border-gray-50 dark:border-darkPrimary">
          <DropdownMenuItem>Option 1</DropdownMenuItem>
          <DropdownMenuItem>Option 2</DropdownMenuItem>
          <DropdownMenuItem>Option 3</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Sign Out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
