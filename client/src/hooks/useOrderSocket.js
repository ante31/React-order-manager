import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { backendUrl } from "../localhostConf";

export function useOrderSocket({
  showStartModal,
  isAdmin,
  fetchOrders,
  setOrders,
}) {
  const socketRef = useRef(null);
  const isRegisteredRef = useRef(false);
  const heartbeatRef = useRef(null);

  useEffect(() => {
    const socket = io(backendUrl, {
      transports: ["polling", "websocket"],
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on("order-added", fetchOrders);

  socket.on("order-updated", (updatedOrder) => {
    console.log("Received order update via socket:", updatedOrder);
    setOrders((prev) =>
      prev.map((order) =>
        order.id === updatedOrder.id
          ? { ...order, ...updatedOrder }
          : order
      )
    );
  });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);

      if (!isRegisteredRef.current) return;

      socket.emit("register", {
        role: isAdmin ? "admin" : "restaurant",
        timestamp: new Date().toISOString(),
      });

      if (!isAdmin) {
        socket.emit("frontend-logged-in", {
          timestamp: new Date().toISOString(),
        });
      }
    });

    const handleBeforeUnload = () => {
      if (!isRegisteredRef.current) return;

      socket.emit("frontend-closed", {
        timestamp: new Date().toISOString(),
      });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);

      clearInterval(heartbeatRef.current);
      socket.disconnect();
      socketRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🔥 LOGIN GATE (JEDINI ENTRY POINT ZA REGISTER + HEARTBEAT)
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    // još nije login
    if (showStartModal) return;

    // already registered guard
    if (isRegisteredRef.current) return;
    isRegisteredRef.current = true;

    const role = isAdmin ? "admin" : "restaurant";

    // 📡 REGISTER (TEK SAD)
    socket.emit("register", {
      role,
      timestamp: new Date().toISOString(),
    });

    console.log("📡 REGISTER SENT:", role);

    // 🚨 SAMO RESTAURANT IDE DALJE U BACKEND FLOW
    if (!isAdmin) {
      socket.emit("frontend-logged-in", {
        timestamp: new Date().toISOString(),
      });

      // ❤️ HEARTBEAT (only restaurant, only after login)
      heartbeatRef.current = setInterval(() => {
        if (socket.connected) {
          socket.emit("heartbeat", {
            timestamp: new Date().toISOString(),
          });
        }
      }, 30000);
    }
  }, [showStartModal, isAdmin]);
}