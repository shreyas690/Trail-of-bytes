import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const useSocket = (token) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!token) return;

    const newSocket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
      auth: { token },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    // Only expose the socket AFTER the server has confirmed the connection.
    // This ensures consumers don't emit events before auth middleware passes.
    newSocket.on("connect", () => {
      setSocket(newSocket);
    });

    newSocket.on("connect_error", (err) => {
      console.error("[Socket] Connection error:", err.message);
    });

    newSocket.on("disconnect", () => {
      setSocket(null);
    });

    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
  }, [token]);

  return socket;
};

export default useSocket;

