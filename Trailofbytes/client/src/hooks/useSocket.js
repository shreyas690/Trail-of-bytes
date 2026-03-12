import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const useSocket = (token) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!token) return;
    const newSocket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
      auth: { token }
    });
    setSocket(newSocket);
    
    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  return socket;
};

export default useSocket;

