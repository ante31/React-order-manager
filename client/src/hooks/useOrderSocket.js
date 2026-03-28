import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { backendUrl } from "../localhostConf";

export function useOrderSocket({ orders, showStartModal, isAdmin, onOrderAdded }) {
  const socketRef = useRef(null);

  useEffect(() => {
    // 1. POPRAVAK: transports uključuje polling i websocket, bez withCredentials
    // Koristimo direktno backendUrl koji mora biti tvoj Railway URL
    const socket = io(backendUrl, { 
      transports: ["polling", "websocket"],
      upgrade: true,
      rememberUpgrade: true
    });
    
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected to Railway:", socket.id);
      
      // Ako NIJE admin i modal je zatvoren, javi se odmah pri spajanju
      if (!isAdmin && !showStartModal) {
        socket.emit("frontend-logged-in", { isAdmin, timestamp: new Date().toISOString() });
      }
    });

    // Dodajemo error logging da točno vidiš ako baci CORS ili 400
    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    const heartbeat = setInterval(() => {
      if (socket.connected && !isAdmin) {
        socket.emit("heartbeat", { isAdmin, timestamp: new Date().toISOString() });
      }
    }, 5000);

    socket.on("order-added", onOrderAdded);

    const handleUnload = () => {
      if (socket.connected && !isAdmin) {
        socket.emit("frontend-closed", { isAdmin, timestamp: new Date().toISOString() });
      }
    };
    
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      clearInterval(heartbeat);
      window.removeEventListener("beforeunload", handleUnload);
      socket.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, backendUrl]); // Dodao backendUrl u dependency da se re-inita ako se promijeni


  // Drugi efekt prati promjenu modala
  useEffect(() => {
    if (socketRef.current?.connected && !isAdmin && !showStartModal) {
      socketRef.current.emit("frontend-logged-in", { isAdmin, timestamp: new Date().toISOString() });
    }
  }, [showStartModal, isAdmin]);

  return socketRef.current;
}
