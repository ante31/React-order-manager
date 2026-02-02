import { useState, useEffect } from "react";
import { backendUrl } from "../localhostConf";
import { safeFetch } from "../services/safeFetch";
import { filterOrders } from "../services/filterOrders";
import playSound from "../services/playSound";

export function useOrders(selectedDate) {
  const [orders, setOrders] = useState([]);
  const [lastHasPending, setLastHasPending] = useState(false);
  const [hasPending, setHasPending] = useState(false);

  const fetchOrders = async () => {
    setOrders([]);
    try {
      const [y, m, d] = selectedDate.split("-");
      const res = await safeFetch(`${backendUrl}/orders/${y}/${m}/${d}`);
      if (!res.ok) return setOrders([]);

      const data = await res.json();
      // Transform data from object to array
      const list = data
        ? Object.entries(data).map(([id, o]) => ({ id, ...o }))
        : [];

      const hasPending = list.some((o) => o.status === "pending");
      setHasPending(hasPending);
      if (hasPending && !lastHasPending) playSound();

      setLastHasPending(hasPending);
      setOrders(list);
    } catch {
      setOrders([]);
    }
  };

    useEffect(() => {
      const interval = setInterval(() => {
        if (hasPending) {
          playSound();
        }
      }, 10000);

      return () => clearInterval(interval);
    }, [hasPending]);

  const handleStatusUpdate = async (orderId, status) => {
    const [y, m, d] = selectedDate.split("-");
    await safeFetch(`${backendUrl}/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, year: y, month: m, day: d }),
    });
    fetchOrders();
  };

  const activeOrders = filterOrders(orders);

  return { orders, activeOrders, fetchOrders, handleStatusUpdate };
}
