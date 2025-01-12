import ChatListing from "./components/ChatListing/ChatListing";
import ChatDisplay from "./components/ChatDisplay/ChatDisplay";
import { useEffect, useState } from "react";
import { getSocketInstance } from "../../utils/helper";

export default function Chat() {
  // const [isConnected, setIsConnected] = useState(getSocketInstance().connected);
  // const [fooEvents, setFooEvents] = useState([]);

  // useEffect(() => {
  //   const socket = getSocketInstance();
  //   function onConnect() {
  //     setIsConnected(true);
  //   }

  //   function onDisconnect() {
  //     setIsConnected(false);
  //   }

  //   function onFooEvent(value) {
  //     setFooEvents((previous) => [...previous, value]);
  //   }

  //   socket.on("connect", onConnect);
  //   socket.on("disconnect", onDisconnect);
  //   socket.on("foo", onFooEvent);

  //   return () => {
  //     socket.off("connect", onConnect);
  //     socket.off("disconnect", onDisconnect);
  //     socket.off("foo", onFooEvent);
  //   };
  // }, []);

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
