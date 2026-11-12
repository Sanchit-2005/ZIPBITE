import { useEffect } from "react";
import { io } from "socket.io-client";

function ChatTest() {
  useEffect(() => {
    const socket = io("http://localhost:8000", {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("✅ Socket.IO connected:", socket.id);
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Socket.IO connection error:", error.message);
    });

    socket.on("message", (data) => {
      console.log("📩 Message received:", data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <h1>Socket Connection Test</h1>
      <p>Check your browser console.</p>
    </div>
  );
}

export default ChatTest;
