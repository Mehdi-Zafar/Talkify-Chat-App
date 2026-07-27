import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { useSocketStore } from "@/zustand";
import ChatListing from "@/components/ChatListing/ChatListing";

export const Route = createFileRoute("/_protected/chat")({
  component: Chat,
});

function Chat() {
  const socketConnect = useSocketStore((state) => state.connect);
  const socketDisconnect = useSocketStore((state) => state.disconnect);

  useEffect(() => {
    socketConnect();
    return () => {
      socketDisconnect();
    };
  }, []);

  return (
    <div className="grid grid-cols-12 items-stretch h-screen">
      <div className="col-span-3 overflow-auto">
        <ChatListing />
      </div>
      <div className="col-span-9">
        <Outlet />
      </div>
    </div>
  );
}
