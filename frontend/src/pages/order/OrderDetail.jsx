
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./OrderDetail.css";

const API_URL = "http://localhost:8000/apiV2/order/my-orders";

export default function OrderDetail() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authToken = localStorage.getItem("token");

        const response = await axios.get(API_URL, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        setOrders(response.data.orders || []);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load orders"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatus = (status) => {
    const value = (status || "").toUpperCase();

    if (["DELIVERED", "COMPLETED"].includes(value)) {
      return "DELIVERED";
    }

    if (["CANCELLED", "CANCELED"].includes(value)) {
      return "CANCELLED";
    }

    return value;
  };

  const filteredOrders = orders.filter((order) => {
    const status = getStatus(order.orderStatus);

    const matchesTab =
      activeTab === "ALL" ||
      (activeTab === "ONGOING" &&
        !["DELIVERED", "CANCELLED"].includes(status)) ||
      status === activeTab;

    const matchesSearch = [
      order._id,
      order.restaurant?.name,
    ]
      .filter(Boolean)
      .some((value) =>
        String(value).toLowerCase().includes(search.toLowerCase())
      );

    return matchesTab && matchesSearch;
  });

  const getStatusLabel = (status) => {
    const value = getStatus(status);

    if (value === "DELIVERED") return "Delivered";
    if (value === "CANCELLED") return "Cancelled";
    if (value === "PLACED") return "Order Placed";
    if (value === "CONFIRMED") return "Confirmed";
    if (value === "PREPARING") return "Preparing";
    if (value === "OUT_FOR_DELIVERY") return "On the way";

    return value.replaceAll("_", " ") || "Processing";
  };

  const getStatusIcon = (status) => {
    const value = getStatus(status);

    if (value === "DELIVERED") return "✓";
    if (value === "CANCELLED") return "✕";
    return "↗";
  };

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN")}`;

  if (loading) {
    return (
      <div className="orders-page">
        <div className="orders-loading">
          <div className="orders-spinner" />
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-page">
        <div className="orders-message">
          <h2>Unable to load orders</h2>
          <p>{error}</p>
          <button
            className="orders-primary-btn"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <main className="orders-main">
        <header className="orders-heading">
          <div>
            <h1>My Orders</h1>
            <p>
              Track your orders, view past orders and reorder
              your favourite meals.
            </p>
          </div>

          <div className="orders-count">
            {orders.length} Orders
          </div>
        </header>

        <div className="orders-toolbar">
          <div className="orders-tabs">
            {[
              { label: "All Orders", value: "ALL" },
              { label: "Ongoing", value: "ONGOING" },
              { label: "Delivered", value: "DELIVERED" },
              { label: "Cancelled", value: "CANCELLED" },
            ].map((tab) => (
              <button
                key={tab.value}
                className={`orders-tab ${
                  activeTab === tab.value ? "active" : ""
                }`}
                onClick={() => setActiveTab(tab.value)}
              >
                {tab.label}
                {tab.value === "ALL" && (
                  <span className="tab-count">{orders.length}</span>
                )}
              </button>
            ))}
          </div>

          <div className="orders-search">
            <span>⌕</span>
            <input
              type="text"
              placeholder="Search restaurant or order ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="orders-empty">
            <div className="empty-icon">🍽️</div>
            <h2>No orders found</h2>
            <p>
              {orders.length === 0
                ? "Your delicious journey starts with your first order."
                : "Try another filter or search term."}
            </p>
            {orders.length > 0 && (
              <button
                className="orders-primary-btn"
                onClick={() => {
                  setActiveTab("ALL");
                  setSearch("");
                }}
              >
                View All Orders
              </button>
            )}
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map((order) => {
              const status = getStatus(order.orderStatus);
              const isDelivered = status === "DELIVERED";
              const isCancelled = status === "CANCELLED";
              const isOngoing = !isDelivered && !isCancelled;

              return (
                <article
                  className={`order-card ${
                    isOngoing ? "ongoing-card" : ""
                  }`}
                  key={order._id}
                >
                  <div className="order-card-top">
                    <img
                      className="restaurant-image"
                      src={
                        order.restaurant?.image ||
                        order.restaurant?.imageUrl ||
                        "/placeholder-restaurant.png"
                      }
                      alt={order.restaurant?.name || "Restaurant"}
                    />

                    <div className="restaurant-info">
                      <h3>
                        {order.restaurant?.name || "Restaurant"}
                      </h3>
                      <p className="restaurant-category">
                        Order #{String(order._id).slice(-8).toUpperCase()}
                      </p>
                      <p className="order-date">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>

                    <div className="order-status-area">
                      <span
                        className={`order-status ${
                          isDelivered
                            ? "status-delivered"
                            : isCancelled
                            ? "status-cancelled"
                            : "status-ongoing"
                        }`}
                      >
                        <span className="status-icon">
                          {getStatusIcon(status)}
                        </span>
                        {getStatusLabel(status)}
                      </span>

                      <span className="payment-status">
                        Payment:{" "}
                        <strong>
                          {String(order.paymentStatus || "PENDING")
                            .replaceAll("_", " ")}
                        </strong>
                      </span>
                    </div>
                  </div>

                  {isOngoing && (
                    <div className="order-tracking">
                      {[
                        { label: "Placed", statuses: ["PLACED", "CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY"] },
                        { label: "Preparing", statuses: ["PREPARING", "OUT_FOR_DELIVERY"] },
                        { label: "On the way", statuses: ["OUT_FOR_DELIVERY"] },
                        { label: "Delivered", statuses: [] },
                      ].map((step, index) => {
                        const currentIndex = [
                          "PLACED",
                          "CONFIRMED",
                          "PREPARING",
                          "OUT_FOR_DELIVERY",
                        ].indexOf(status);

                        const complete =
                          index < currentIndex ||
                          (index === 0 &&
                            ["PLACED", "CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY"].includes(status));

                        const current = index === currentIndex;

                        return (
                          <div
                            className={`tracking-step ${
                              complete ? "completed" : ""
                            } ${current ? "current" : ""}`}
                            key={step.label}
                          >
                            <div className="tracking-circle">
                              {complete && !current ? "✓" : index + 1}
                            </div>
                            <span>{step.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="order-card-bottom">
                    <div className="ordered-items">
                      {(order.items || []).map((item, index) => (
                        <div
                          className="ordered-item"
                          key={item._id || `${item.name}-${index}`}
                        >
                          <img
                            src={
                              item.image ||
                              item.menuItem?.image ||
                              item.menuItem?.imageUrl ||
                              "/placeholder-food.png"
                            }
                            alt={item.name || item.menuItem?.name || "Food"}
                          />

                          <div className="ordered-item-info">
                            <span>
                              {item.name || item.menuItem?.name || "Menu item"}
                            </span>
                            <small>
                              x{item.quantity || 1}
                            </small>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="order-total">
                      <span>Total Amount</span>
                      <strong>{formatAmount(order.totalAmount)}</strong>
                    </div>

                    <div className="order-actions">
                      <button
                        className="order-btn details-btn"
                        onClick={() => {
                          window.alert(
                            `Order ID: ${order._id}\nStatus: ${getStatusLabel(status)}\nPayment: ${order.paymentStatus || "PENDING"}\nTotal: ${formatAmount(order.totalAmount)}`
                          );
                        }}
                      >
                        View Details <span>›</span>
                      </button>

                      {isDelivered && (
                        <button
                          className="order-btn reorder-btn"
                          onClick={() =>
                            window.alert(
                              "Connect this button to your add-to-cart API to reorder."
                            )
                          }
                        >
                          ↻ Reorder
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
