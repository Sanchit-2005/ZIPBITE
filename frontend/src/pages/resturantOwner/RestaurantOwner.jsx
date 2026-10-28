
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

export default function RestaurantOwner() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please log in to access restaurant orders.");
      }

      const response = await axios.get(
        "http://localhost:8000/apiV4/restaurant-owner/orders",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrders(response.data.orders || []);
    } catch (err) {
      console.error("Error fetching orders:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch orders. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "DELIVERED":
        return "#16a34a";
      case "PREPARING":
        return "#d97706";
      case "ACCEPTED":
        return "#2563eb";
      case "REJECTED":
      case "CANCELLED":
        return "#dc2626";
      default:
        return "#64748b";
    }
  };

  if (loading) {
    return (
      <div className="owner-state">
        <div className="spinner" />
        <p>Loading restaurant orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="owner-state">
        <h3>Unable to load orders</h3>
        <p className="error-message">{error}</p>
        <button onClick={fetchOrders}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="owner-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Restaurant Orders</h1>
          <p>Manage and track your incoming orders.</p>
        </div>

        <button className="refresh-btn" onClick={fetchOrders}>
          ↻ Refresh
        </button>
      </div>

      <div className="order-summary">
        <div className="summary-card">
          <span>Total Orders</span>
          <h2>{orders.length}</h2>
        </div>

        <div className="summary-card">
          <span>Placed</span>
          <h2>
            {
              orders.filter(
                (o) => o.orderStatus?.toUpperCase() === "PLACED"
              ).length
            }
          </h2>
        </div>

        <div className="summary-card">
          <span>Preparing</span>
          <h2>
            {
              orders.filter(
                (o) => o.orderStatus?.toUpperCase() === "PREPARING"
              ).length
            }
          </h2>
        </div>

        <div className="summary-card">
          <span>Delivered</span>
          <h2>
            {
              orders.filter(
                (o) => o.orderStatus?.toUpperCase() === "DELIVERED"
              ).length
            }
          </h2>
        </div>
      </div>

      <div className="orders-section">
        <h2>All Orders</h2>

        {orders.length === 0 ? (
          <div className="empty-orders">
            <h3>No orders yet</h3>
            <p>New customer orders will appear here.</p>
          </div>
        ) : (
          <div className="orders-grid">
            {orders.map((order) => (
              <div
                className="order-card"
                key={order._id || order.id}
              >
                <div className="order-card-header">
                  <div>
                    <span className="order-label">Order ID</span>
                    <h3>
                      #{String(order._id || order.id).slice(-8)}
                    </h3>
                  </div>

                  <span
                    className="order-status"
                    style={{
                      color: getStatusColor(order.orderStatus),
                      backgroundColor: `${getStatusColor(
                        order.orderStatus
                      )}15`,
                    }}
                  >
                    {(order.orderStatus || "PLACED").replaceAll(
                      "_",
                      " "
                    )}
                  </span>
                </div>

                <div className="order-info">
                  <p>
                    <strong>Customer:</strong>{" "}
                    {order.customer?.name ||
                      order.customerName ||
                      "Customer"}
                  </p>

                  <p>
                    <strong>Items:</strong>{" "}
                    {order.items?.length || 0}
                  </p>

                  <p>
                    <strong>Total:</strong> ₹
                    {Number(
                      order.totalAmount ?? order.total ?? 0
                    ).toFixed(2)}
                  </p>

                  <p>
                    <strong>Payment:</strong>{" "}
                    {order.paymentStatus || "Unknown"}
                  </p>

                  <p>
                    <strong>Date:</strong>{" "}
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString(
                          "en-IN"
                        )
                      : "Not available"}
                  </p>
                </div>

                <div className="ordered-items">
                  <strong>Ordered Items</strong>

                  {order.items?.length ? (
                    <ul>
                      {order.items.map((item, index) => (
                        <li key={item._id || index}>
                          {item.menuItem?.name ||
                            item.name ||
                            "Menu item"}{" "}
                          × {item.quantity || 1}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No item details available.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
