// import logo from "@/assets/logo.webp";
// import avatarImg from "@/assets/avatar.webp";
// import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
// import {
//   Menu,
//   MenuHandler,
//   MenuList,
//   MenuItem,
// } from "@material-tailwind/react/components/Menu";
// import Spinner from "@material-tailwind/react/components/Spinner";
// import { useQuery, useQueryClient } from "@tanstack/react-query";
// import { ChatAPI } from "@/api";
// import { useEffect, useRef, useState } from "react";
// import { useSocketStore, useUserStore } from "@/zustand";
// import { Message, SocketEvent } from "@/utils/contracts";
// import { formatMessageTime, groupMessagesByDate } from "@/utils/helper";

// export default function ChatDisplay() {
//   const id = 2;
//   const user = useUserStore((state) => state.user);
//   const joinChat = useSocketStore((state) => state.joinChat);
//   const socketEmit = useSocketStore((state) => state.emit);
//   const socket = useSocketStore((state) => state.socket);
//   const [newMsg, setNewMsg] = useState("");
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [activeDateLabel, setActiveDateLabel] = useState("");
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const containerRef = useRef<HTMLDivElement>(null);
//   const queryClient = useQueryClient();

//   const { data: chat, isFetching: fetchingChats } = useQuery({
//     queryKey: ["chat", id],
//     queryFn: () => ChatAPI.getChatsByChatId(Number(id)),
//     enabled: !!id && !isNaN(Number(id)),
//     refetchOnWindowFocus: false,
//     staleTime: Infinity,
//   });

//   // Sync messages when chat loads
//   useEffect(() => {
//     if (!chat?.id) return;
//     joinChat(chat.id);
//     setMessages(chat.messages ?? []);
//   }, [chat?.id]);

//   const updateLastMessageInCache = (message: Message) => {
//     queryClient.setQueryData(["chats", user?.id], (oldData: any) => {
//       if (!oldData) return oldData;

//       const updatedChats = oldData.map((chat: any) => {
//         if (chat.id !== message.chat_id) return chat;

//         // Only update the chat that received the new message
//         return {
//           ...chat,
//           lastMessage: {
//             content: message.content,
//             createdAt: message.createdAt,
//             isOwn: message.sender.id === user?.id,
//           },
//           // Bubble this chat to top of list — same as WhatsApp
//           updatedAt: message.createdAt,
//         };
//       });

//       // Re-sort by updatedAt so active chat moves to top
//       return [
//         ...updatedChats?.sort(
//           (a: any, b: any) =>
//             new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
//         ),
//       ];
//     });
//   };

//   // Listen for new messages via socket
//   useEffect(() => {
//     if (!socket) return;

//     const handleNewMessage = (message: Message) => {
//       setMessages((prev) => [...prev, message]);
//       updateLastMessageInCache(message);
//     };

//     socket.on(SocketEvent.RECEIVE_MSG, handleNewMessage);
//     return () => {
//       socket.off(SocketEvent.RECEIVE_MSG, handleNewMessage);
//     };
//   }, [socket]);

//   // Scroll to bottom on new message
//   useEffect(() => {
//     if (!messages?.length) return;
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages.length]);

//   // Update active date label on scroll
//   useEffect(() => {
//     const container = containerRef.current;
//     if (!container) return;

//     const handleScroll = () => {
//       const markers = container.querySelectorAll<HTMLElement>("[data-date]");

//       let current = "";
//       markers.forEach((marker) => {
//         if (marker.offsetTop <= container.scrollTop + 10) {
//           current = marker.getAttribute("data-date") || "";
//         }
//       });

//       setActiveDateLabel(current);
//     };

//     container.addEventListener("scroll", handleScroll);
//     return () => container.removeEventListener("scroll", handleScroll);
//   }, [messages.length]);

//   function sendMessage() {
//     if (!chat || !user || !newMsg.trim()) return;
//     const message = new Message();
//     message.chat_id = chat?.id;
//     message.sender = { ...message.sender, id: user?.id, image: user?.image };
//     message.content = newMsg;
//     message.createdAt = new Date().toISOString();

//     setMessages((prev) => [...prev, message]);
//     updateLastMessageInCache(message);
//     socketEmit(SocketEvent.SEND_MSG, message);
//     setNewMsg("");
//   }

//   function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       sendMessage();
//     }
//   }

//   const groupedMessages = groupMessagesByDate(messages ?? []);

//   return (
//     <div className="h-screen">
//       {fetchingChats ? (
//         <div className="h-full flex justify-center items-center">
//           <Spinner color="blue" />
//         </div>
//       ) : id ? (
//         <div className="flex flex-col justify-between h-full">
//           <div className="w-full h-full flex flex-col justify-between">
//             {/* Header */}
//             <div className="w-full flex justify-between items-center py-3 px-4 border-gray-50 dark:border-darkBg border-y bg-lightBg dark:bg-darkBg">
//               <div className="flex gap-3 items-center">
//                 <img
//                   src={avatarImg}
//                   alt="Avatar"
//                   className="h-10 w-10 rounded-full object-cover"
//                 />
//                 <h3 className="text-sm font-semibold text-lightText dark:text-darkText">
//                   {chat?.name}
//                 </h3>
//               </div>
//               <Menu>
//                 <MenuHandler>
//                   <EllipsisVerticalIcon
//                     width={25}
//                     className="text-lightText dark:text-darkText cursor-pointer"
//                   />
//                 </MenuHandler>
//                 <MenuList className="bg-lightBg dark:bg-darkBg border-gray-50 dark:border-darkPrimary">
//                   <MenuItem className="flex items-center gap-2">xZX</MenuItem>
//                   <MenuItem className="flex items-center gap-2">xx</MenuItem>
//                   <MenuItem className="flex items-center gap-2">xzXZ</MenuItem>
//                   <hr className="my-2 border-blue-gray-50" />
//                   <MenuItem className="flex items-center gap-2">
//                     Sign Out
//                   </MenuItem>
//                 </MenuList>
//               </Menu>
//             </div>

//             {/* Messages container */}
//             <div
//               ref={containerRef}
//               className="p-4 h-[80%] overflow-auto flex-1 flex flex-col relative"
//             >
//               {/* Sticky date banner */}
//               {activeDateLabel && (
//                 <div className="sticky top-2 z-10 flex justify-center pointer-events-none">
//                   <span className="bg-gray-100 dark:bg-darkBg text-gray-500 dark:text-gray-400 text-xs font-medium px-3 py-1 rounded-full shadow-sm">
//                     {activeDateLabel}
//                   </span>
//                 </div>
//               )}

//               {groupedMessages.map((group) => (
//                 <div key={group.date}>
//                   {/* Date separator with marker */}
//                   <div
//                     data-date={group.date}
//                     className="flex items-center gap-2 my-3"
//                   >
//                     <hr className="flex-1 border-gray-200 dark:border-darkPrimary" />
//                     <span className="text-xs text-gray-400 dark:text-gray-500 font-medium px-2">
//                       {group.date}
//                     </span>
//                     <hr className="flex-1 border-gray-200 dark:border-darkPrimary" />
//                   </div>

//                   {/* Messages for this date */}
//                   {group.messages.map((message: Message, index: number) =>
//                     message?.sender?.id !== user?.id ? (
//                       // Other user — left side
//                       <div
//                         key={message.id ?? index}
//                         className="flex gap-2.5 mb-4"
//                       >
//                         <img
//                           src={message?.sender?.image || avatarImg}
//                           alt="Avatar"
//                           className="w-10 h-10 rounded-full"
//                         />
//                         <div className="grid">
//                           <div className="w-max grid">
//                             <div className="px-3.5 py-2 bg-lightBg dark:bg-darkBg rounded justify-start items-center gap-3 inline-flex">
//                               <h5 className="text-lightText dark:text-darkText text-sm font-medium leading-snug">
//                                 {message?.content}
//                               </h5>
//                             </div>
//                             <div className="justify-end items-center inline-flex mb-2.5">
//                               <h6 className="text-gray-500 text-xs font-normal leading-4 py-1">
//                                 {formatMessageTime(message?.createdAt)}
//                               </h6>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     ) : (
//                       // Current user — right side
//                       <div
//                         key={message.id ?? index}
//                         className="flex gap-2.5 justify-end mb-4"
//                       >
//                         <div>
//                           <div className="grid mb-2">
//                             <h5 className="text-right text-gray-900 text-sm font-semibold leading-snug pb-1">
//                               You
//                             </h5>
//                             <div className="px-3 py-2 bg-lightPrimary dark:bg-darkPrimary rounded">
//                               <h2 className="text-darkText text-sm font-normal leading-snug">
//                                 {message?.content}
//                               </h2>
//                             </div>
//                             <div className="justify-start items-center inline-flex">
//                               <h3 className="text-gray-500 text-xs font-normal leading-4 py-1">
//                                 {formatMessageTime(message?.createdAt)}
//                               </h3>
//                             </div>
//                           </div>
//                         </div>
//                         <img
//                           src={message?.sender?.image || avatarImg}
//                           alt="Avatar"
//                           className="w-10 h-10 rounded-full"
//                         />
//                       </div>
//                     ),
//                   )}
//                 </div>
//               ))}

//               {/* Scroll target */}
//               <div ref={messagesEndRef} />
//             </div>

//             {/* Input */}
//             <div className="w-[95%] mx-auto mb-2 px-4 py-2 rounded-3xl border border-gray-200 dark:border-darkPrimary items-center gap-2 inline-flex justify-between">
//               <div className="flex items-center gap-2 flex-1">
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   width="22"
//                   height="22"
//                   viewBox="0 0 22 22"
//                   fill="none"
//                 >
//                   <g id="User Circle">
//                     <path
//                       id="icon"
//                       d="M6.05 17.6C6.05 15.3218 8.26619 13.475 11 13.475C13.7338 13.475 15.95 15.3218 15.95 17.6M13.475 8.525C13.475 9.89191 12.3669 11 11 11C9.6331 11 8.525 9.89191 8.525 8.525C8.525 7.1581 9.6331 6.05 11 6.05C12.3669 6.05 13.475 7.1581 13.475 8.525ZM19.25 11C19.25 15.5563 15.5563 19.25 11 19.25C6.44365 19.25 2.75 15.5563 2.75 11C2.75 6.44365 6.44365 2.75 11 2.75C15.5563 2.75 19.25 6.44365 19.25 11Z"
//                       stroke="#4F46E5"
//                       strokeWidth="1.6"
//                     />
//                   </g>
//                 </svg>
//                 <input
//                   className="grow shrink basis-0 text-lightText dark:text-darkText bg-lightBg dark:bg-darkBg border dark:border-darkPrimary rounded-md py-3 px-4 text-xs font-medium leading-4 focus:outline-none"
//                   placeholder="Type here..."
//                   value={newMsg}
//                   onChange={(e) => setNewMsg(e.target.value)}
//                   onKeyDown={handleKeyDown}
//                 />
//               </div>
//               <div className="flex items-center gap-2">
//                 <svg
//                   className="cursor-pointer"
//                   xmlns="http://www.w3.org/2000/svg"
//                   width="22"
//                   height="22"
//                   viewBox="0 0 22 22"
//                   fill="none"
//                 >
//                   <g id="Attach 01">
//                     <g id="Vector">
//                       <path
//                         d="M14.9332 7.79175L8.77551 14.323C8.23854 14.8925 7.36794 14.8926 6.83097 14.323C6.294 13.7535 6.294 12.83 6.83097 12.2605L12.9887 5.72925M12.3423 6.41676L13.6387 5.04176C14.7126 3.90267 16.4538 3.90267 17.5277 5.04176C18.6017 6.18085 18.6017 8.02767 17.5277 9.16676L16.2314 10.5418M16.8778 9.85425L10.72 16.3855C9.10912 18.0941 6.49732 18.0941 4.88641 16.3855C3.27549 14.6769 3.27549 11.9066 4.88641 10.198L11.0441 3.66675"
//                         stroke="#9CA3AF"
//                         strokeWidth="1.6"
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                       />
//                     </g>
//                   </g>
//                 </svg>
//                 <button
//                   onClick={sendMessage}
//                   disabled={!newMsg.trim()}
//                   className="items-center flex px-3 py-2 bg-lightPrimary dark:bg-darkPrimary rounded-full shadow disabled:opacity-70 disabled:cursor-not-allowed"
//                 >
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     width="16"
//                     height="16"
//                     viewBox="0 0 16 16"
//                     fill="none"
//                   >
//                     <g id="Send 01">
//                       <path
//                         id="icon"
//                         d="M9.04071 6.959L6.54227 9.45744M6.89902 10.0724L7.03391 10.3054C8.31034 12.5102 8.94855 13.6125 9.80584 13.5252C10.6631 13.4379 11.0659 12.2295 11.8715 9.81261L13.0272 6.34566C13.7631 4.13794 14.1311 3.03408 13.5484 2.45139C12.9657 1.8687 11.8618 2.23666 9.65409 2.97257L6.18714 4.12822C3.77029 4.93383 2.56187 5.33664 2.47454 6.19392C2.38721 7.0512 3.48957 7.68941 5.69431 8.96584L5.92731 9.10074C6.23326 9.27786 6.38623 9.36643 6.50978 9.48998C6.63333 9.61352 6.72189 9.7665 6.89902 10.0724Z"
//                         stroke="white"
//                         strokeWidth="1.6"
//                         strokeLinecap="round"
//                       />
//                     </g>
//                   </svg>
//                   <h3 className="text-white text-xs font-semibold leading-4 px-2">
//                     Send
//                   </h3>
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       ) : (
//         <div className="w-full h-full flex flex-col items-center justify-center text-lightText dark:text-darkText">
//           <img src={logo} alt="Logo Image" className="w-56" />
//           <p className="text-base">Your Messaging App</p>
//         </div>
//       )}
//     </div>
//   );
// }
