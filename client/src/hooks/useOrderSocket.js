import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { backendUrl } from "../localhostConf";

export function useOrderSocket({ orders, showStartModal, isAdmin, onOrderAdded }) {
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(backendUrl, { transports: ["websocket"] });
    socketRef.current = socket;

    const heartbeat = setInterval(() => {
      if (socket.connected) {
        socket.emit("heartbeat", { timestamp: new Date().toISOString() });
      }
    }, 5000);

    socket.on("order-added", onOrderAdded);

    const handleUnload = () => {
      socket.emit("frontend-closed", { timestamp: new Date().toISOString() });
    };
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      clearInterval(heartbeat);
      window.removeEventListener("beforeunload", handleUnload);
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!showStartModal && !isAdmin && socketRef.current?.connected) {
      socketRef.current.emit("frontend-logged-in", { timestamp: Date.now() });
    }
  }, [showStartModal, isAdmin]);
}
