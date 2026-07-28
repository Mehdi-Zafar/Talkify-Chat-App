import { createFileRoute } from "@tanstack/react-router";
import {
  User,
  Bell,
  MessageSquareMore,
  LockKeyhole,
  Server,
  Palette,
  Wrench,
  CircleHelp,
  Users,
  Info,
} from "lucide-react";
import { twMerge } from "tailwind-merge";
import { Link, Outlet, useLocation } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/settings")({
  component: Settings,
});

const settingsTabs = [
  { name: "Account Settings", link: "/account", icon: User },
  { name: "Notifications", link: "/notifications", icon: Bell },
  { name: "Chat Settings", link: "/chat", icon: MessageSquareMore },
  { name: "Privacy", link: "/privacy", icon: LockKeyhole },
  { name: "Data and Storage", link: "/data-storage", icon: Server },
  { name: "Appearance", link: "/appearance", icon: Palette },
  { name: "Advanced", link: "/advanced", icon: Wrench },
  { name: "Help and Support", link: "/help", icon: CircleHelp },
  { name: "Invite Friends", link: "/invite", icon: Users },
  { name: "About", link: "/about", icon: Info },
];

const BASE_URL = "/settings";

function Settings() {
  const pathname = useLocation({
    select: (location) => location.pathname,
  });

  return (
    <div>
      <div className="h-screen overflow-auto w-full max-w-[20rem] bg-lightBg dark:bg-darkBg p-2 shadow-xl">
        <div className="mb-2 p-2">
          <h2 className="text-xl font-semibold text-lightText dark:text-darkText">
            Settings
          </h2>
        </div>
        <ul className="flex flex-col gap-1">
          {settingsTabs.map((tab) => {
            const isActive = pathname === `${BASE_URL}${tab.link}`;
            return (
              <li key={tab.name}>
                <Link to={`${BASE_URL}${tab.link}`}>
                  <div
                    className={twMerge(
                      "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-lightText dark:text-darkText cursor-pointer hover:bg-lightPrimary dark:hover:bg-darkPrimary hover:text-lightBg",
                      isActive &&
                        "bg-lightPrimary dark:bg-darkPrimary text-lightBg",
                    )}
                  >
                    <tab.icon
                      className={twMerge(
                        "w-5 h-5 text-lightText dark:text-lightBg group-hover:text-lightBg",
                        isActive && "text-lightBg",
                      )}
                    />
                    {tab.name}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      <Outlet />
    </div>
  );
}
