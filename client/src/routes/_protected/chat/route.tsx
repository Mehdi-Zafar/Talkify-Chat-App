import { createFileRoute, Outlet } from "@tanstack/react-router";
import ChatListing from "@/components/ChatListing/ChatListing";

export const Route = createFileRoute("/_protected/chat")({
  component: Chat,
});

function Chat() {
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
