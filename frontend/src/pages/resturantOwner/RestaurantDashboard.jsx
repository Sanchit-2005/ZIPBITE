import React, { useEffect, useMemo, useState } from "react";
import { useRestaurantOwner } from "../../context/RestaurantOwnerContext";
import "./RestaurantDashboard.css";
import SalesByCategory from "./SalesByCategory";

export default function RestaurantDashboard() {
  const { orders, loading, error, fetchOrders } = useRestaurantOwner();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const getItemInfo = (item) => ({
    category: item.category || item.menuItem?.category || "Other",
    amount: (item.price || item.menuItem?.price || 0) * (item.quantity || 1),
  });

  const categorySales = useMemo(() => {
    const totals = {};

    orders.forEach((order) => {
      if (order.orderStatus === "CANCELED") return;

      (order.items || []).forEach((item) => {
        const { category, amount } = getItemInfo(item);
        totals[category] = (totals[category] || 0) + amount;
      });
    });

    return Object.entries(totals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 4);
  }, [orders]);

  const totalOrders = orders.length;

  const totalRevenue = useMemo(() => {
    return orders.reduce((acc, order) => {
      if (order.paymentStatus === "PAID") {
        acc += order.totalAmount || 0;
      }
      return acc;
    }, 0);
  }, [orders]);

  const canceledOrders = useMemo(() => {
    return orders.filter((order) => order.orderStatus === "CANCELED").length;
  }, [orders]);

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      await fetchOrders();
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) return <p>Loading dashboard...</p>;

  if (error) return <p>{error}</p>;

  return (
    <div className="owner-dashboard">
      <div className="dashboard-header">
        <h1>Restaurant Dashboard</h1>

        <button onClick={handleRefresh} disabled={refreshing}>
          {refreshing ? "Refreshing..." : "Refresh Orders"}
        </button>

        <p>Total Orders: {totalOrders}</p>
        <p>Canceled Orders: {canceledOrders}</p>

        <p>Total Revenue: ₹{totalRevenue.toFixed(2)}</p>
      </div>
      <div>
        <h2>Sales by Category</h2>
        <SalesByCategory
          data={categorySales}
          onSeeMore={() => navigate("/restaurant-owner/orders")}
        />
      </div>

      <div>
        <h2>Recent Orders</h2>

        {orders.length === 0 ? (
          <p>No orders available.</p>
        ) : (
          <ul>
            {orders.map((order) => (
              <li key={order._id}>
                <p>Order ID: {order._id}</p>

                <p>Total Amount: ₹{order.totalAmount?.toFixed(2)}</p>

                <p>Payment Status: {order.paymentStatus}</p>

                <p>Order Status: {order.orderStatus}</p>

                <p>Ordered At: {new Date(order.orderedAt).toLocaleString()}</p>

                <p>Customer: {order.customer?.name || "N/A"}</p>

                <hr />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
