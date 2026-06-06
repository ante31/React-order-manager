export function filterOrders(orders) {
    return orders.filter((order) => {
      return order.status !== "rejected" && order.status !== "auto-rejected";
    });
  }
  