import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const useSocket = (token) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) return;
    const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
      auth: { token }
    });
    socketRef.current = socket;
    return () => socket.disconnect();
  }, [token]);

  return socketRef;
};

export default useSocket;

