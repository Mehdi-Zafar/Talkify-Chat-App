import { createFileRoute } from "@tanstack/react-router";
import {
  List,
  ListItem,
  ListItemPrefix,
} from "@material-tailwind/react/components/List";
import { Card } from "@material-tailwind/react/components/Card";

import {
  UserIcon,
  BellIcon,
  ChatBubbleLeftRightIcon,
  LockClosedIcon,
  ServerStackIcon,
  SwatchIcon,
  WrenchScrewdriverIcon,
  QuestionMarkCircleIcon,
  UserGroupIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { twMerge } from "tailwind-merge";
import { Link, Outlet, useLocation } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/settings")({
  component: Settings,
});

const settingsTabs = [
  { name: "Account Settings", link: "/account", icon: UserIcon },
  { name: "Notifications", link: "/notifications", icon: BellIcon },
  { name: "Chat Settings", link: "/chat", icon: ChatBubbleLeftRightIcon },
  { name: "Privacy", link: "/privacy", icon: LockClosedIcon },
  { name: "Data and Storage", link: "/data-storage", icon: ServerStackIcon },
  { name: "Appearance", link: "/appearance", icon: SwatchIcon },
  { name: "Advanced", link: "/advanced", icon: WrenchScrewdriverIcon },
  { name: "Help and Support", link: "/help", icon: QuestionMarkCircleIcon },
  { name: "Invite Friends", link: "/invite", icon: UserGroupIcon },
  { name: "About", link: "/about", icon: InformationCircleIcon },
];

const BASE_URL = "/settings";

function Settings() {
  const pathname = useLocation({
    select: (location) => location.pathname,
  });
  return (
    <div>
      <Card className="h-screen overflow-auto w-full max-w-[20rem] bg-lightBg dark:bg-darkBg p-2 shadow-xl shadow-blue-gray-900/5">
        <div className="mb-2 p-2">
          <h2 className="text-xl font-semibold text-lightText dark:text-darkText">
            Settings
          </h2>
        </div>
        <List>
          {settingsTabs.map((tab) => (
            <Link key={tab.name} to={`${BASE_URL}${tab.link}`}>
              <ListItem
                className={twMerge(
                  `group text-sm text-lightText dark:text-darkText hover:bg-lightPrimary dark:hover:bg-darkPrimary hover:text-lightBg focus:bg-lightPrimary dark:focus:bg-darkPrimary focus:bg-opacity-100 hover:bg-opacity-100 active:bg-lightPrimary active:dark:bg-darkPrimary active:bg-opacity-100 focus:text-lightBg active:text-lightBg`,
                  `${
                    pathname === `${BASE_URL}${tab.link}` &&
                    "bg-lightPrimary dark:bg-darkPrimary text-lightBg"
                  }`,
                )}
              >
                <ListItemPrefix>
                  {
                    <tab.icon
                      className={twMerge(
                        `w-5 h-5 text-lightText dark:text-lightBg group-hover:text-lightBg`,
                        `${
                          pathname === `${BASE_URL}${tab.link}` &&
                          "text-lightBg"
                        }`,
                      )}
                    />
                  }
                </ListItemPrefix>
                {tab.name}
              </ListItem>
            </Link>
          ))}
        </List>
      </Card>
      <Outlet />
    </div>
  );
}
