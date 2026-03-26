import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { backendUrl } from "../localhostConf";

export function useOrderSocket({ orders, showStartModal, isAdmin, onOrderAdded }) {
  const socketRef = useRef(null);

  useEffect(() => {
    // Ako je admin, spajamo se samo za "order-added", bez ostalih funkcionalnosti
    const socket = io(backendUrl, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      onOrderAdded();
      // Ako NIJE admin i modal je zatvoren, javi se odmah pri spajanju
      if (!isAdmin && !showStartModal) {
        socket.emit("frontend-logged-in", { isAdmin, timestamp: new Date().toISOString() });
      }
    });

    const heartbeat = setInterval(() => {
      if (socket.connected && !isAdmin) {
        socket.emit("heartbeat", { isAdmin, timestamp: new Date().toISOString() });
      }
    }, 5000);

    socket.on("order-added", onOrderAdded);

    const handleUnload = () => {
      if (!isAdmin) {
        socket.emit("frontend-closed", { isAdmin, timestamp: new Date().toISOString() });
      }
    };
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      clearInterval(heartbeat);
      window.removeEventListener("beforeunload", handleUnload);
      socket.disconnect();
    };
  }, [isAdmin]); // Re-connect ako se isAdmin promijeni

  // Drugi efekt prati promjenu modala
  useEffect(() => {
    if (socketRef.current?.connected && !isAdmin && !showStartModal) {
      socketRef.current.emit("frontend-logged-in", { isAdmin, timestamp: new Date().toISOString() });
    }
  }, [showStartModal, isAdmin]);
}