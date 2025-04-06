import ChatListing from "./components/ChatListing/ChatListing";
import ChatDisplay from "./components/ChatDisplay/ChatDisplay";
import { useEffect } from "react";
import { useSocketStore } from "@/zustand";
import { useParams } from "react-router-dom";

export default function Chat() {
  const { id } = useParams();
  const socketConnect = useSocketStore((state) => state.connect);
  const socketDisconnect = useSocketStore((state) => state.disconnect);

  useEffect(() => {
    if (id) {
      socketConnect();
    }

    return () => {
      socketDisconnect();
    };
  }, [id]);

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
