import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { twMerge } from "tailwind-merge";
import avatarImg from "../../../../assets/avatar.png";
import { useNavigate, useParams } from "react-router-dom";
import { ButtonComp } from "../../../../components";

const chats = [1, 2, 3, 4, 5, 6, 7, 8];
// const chats = [];

export default function ChatListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  return (
    <div className="h-full flex flex-col py-2 border-r border-gray-50 dark:border-darkBg">
      <div className="px-4 py-2.5 flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-lightText dark:text-darkText">
          Chats
        </h2>
        <EllipsisVerticalIcon
          width={25}
          className="text-lightText dark:text-darkText"
        />
      </div>
      <div className="w-full max-w-sm min-w-[200px] px-4">
        <div className="relative my-2">
          <input
            type="text"
            className="w-full bg-lightBg dark:bg-darkBg placeholder:text-slate-400 text-lightText dark:text-darkText text-sm border border-slate-200 dark:border-none rounded-md pl-8 pr-4 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
            placeholder="Search"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="blue"
            className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2"
          >
            <path
              fill-rule="evenodd"
              d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
              clip-rule="evenodd"
            ></path>
          </svg>
        </div>
      </div>
      <div></div>
      <div className="flex-1 overflow-auto py-4 px-4 space-y-4">
        {chats?.length > 0 ? (
          chats?.map((chat) => (
            <div
              className={twMerge(
                `py-3 px-4 bg-lightBg dark:bg-darkBg shadow-sm rounded-md flex justify-between cursor-pointer duration-500 text-lightText dark:text-darkText ease-in-out hover:bg-lightPrimary dark:hover:bg-darkPrimary hover:text-white`,
                id == chat.toString() &&
                  "bg-lightPrimary dark:bg-darkPrimary text-white"
              )}
              onClick={() => navigate(`/chat/${chat}`)}
            >
              <div className="flex gap-3 items-center">
                <img
                  src={avatarImg}
                  alt="Avatar"
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-sm font-semibold">David Hussey</h3>
                  <small className="text-[11px] line-clamp-1 opacity-80 font-medium">
                    Message Content dasdasdasdasdsaddas
                  </small>
                </div>
              </div>
              <div className="flex flex-col shrink-0">
                <small className="text-xs font-medium opacity-80">
                  07:00 pm
                </small>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <h2 className="text-lightText dark:text-darkText">
              No Chats to Display!
            </h2>
            <ButtonComp label="Add New Chat" className="w-fit" />
          </div>
        )}
      </div>
    </div>
  );
}
