import { useEffect, useState, useMemo } from "react";
import { Navigate } from "react-router-dom";
import { io } from "socket.io-client";

export default function Home() {
  const socket = useMemo(() => io("ws://localhost:3000"), []);
  const [socketId, setSocketId] = useState();
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState([]);

  return <Navigate to="/sign-in" />;

  // useEffect(() => {
  //   socket.on("connect", () => {
  //     console.log("connected", socket.id);
  //     setSocketId(socket.id);
  //   });

  //   socket.on("receive", (data) => {
  //     setMessages((prev) => [...prev, data]);
  //   });
  // }, []);

  // function sendMsg(e) {
  //   e.preventDefault();
  //   if (msg) {
  //     socket.emit("message", msg);
  //     setMessages((prev) => [...prev, msg]);
  //     setMsg("");
  //   }
  // }

  return (
    <div>
      {/* <h1>React Chat App</h1>
      <h5>{socketId}</h5>
      <form onSubmit={sendMsg}>
        <input
          type="text"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          className="border"
        />
        <button>Send</button>
      </form>
      <div>
        <ul>
          {messages?.map((message) => (
            <li>{message}</li>
          ))}
        </ul>
      </div> */}
    </div>
  );
}
