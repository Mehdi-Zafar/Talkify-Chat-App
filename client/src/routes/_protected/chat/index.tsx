import { createFileRoute } from "@tanstack/react-router";
import logo from "@/assets/logo.webp";

export const Route = createFileRoute("/_protected/chat/")({
  component: ChatEmpty,
});

function ChatEmpty() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-lightText dark:text-darkText">
      <img src={logo} alt="Logo Image" className="w-56" />
      <p className="text-base">Your Messaging App</p>
    </div>
  );
}
