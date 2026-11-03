import { useRestaurantOwner } from "../../context/RestaurantOwnerContext";
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./RestaurantOrders.css";

export default function RestaurantOrders() {
  const { orders, fetchOrders } = useRestaurantOwner();
  const navigate = useNavigate();

  const [filter, setFilter] = useState("ALL");

  const filters = [
    "ALL",
    "PLACED",
    "PREPARING",
    "READY_FOR_PICKUP",
    "OUT_FOR_DELIVERY",
    "COMPLETED",
    "CANCELLED",
  ];

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const newOrders = useMemo(
    () => orders.filter((order) => order.orderStatus === "PLACED"),
    [orders]
  );

  const preparingOrders = useMemo(
    () => orders.filter((order) => order.orderStatus === "PREPARING"),
    [orders]
  );

  const filteredOrders = useMemo(
    () =>
      orders.filter(
        (order) => filter === "ALL" || order.orderStatus === filter
      ),
    [orders, filter]
  );

  const getStatusClass = (status) => {
    const classes = {
      PLACED: "placed",
      PREPARING: "preparing",
      READY_FOR_PICKUP: "ready",
      OUT_FOR_DELIVERY: "delivery",
      COMPLETED: "completed",
      CANCELLED: "cancelled",
    };

    return classes[status] || "default";
  };

  const formatStatus = (status) => status.replaceAll("_", " ");

  // Display-only helper: count of orders per filter tab
  const countFor = (option) =>
    option === "ALL"
      ? orders.length
      : orders.filter((order) => order.orderStatus === option).length;

  const stats = [
    {
      title: "Total Orders",
      value: orders.length,
      icon: "bi-receipt-cutoff",
      color: "orange",
      description: "All received orders",
    },
    {
      title: "New Orders",
      value: newOrders.length,
      icon: "bi-bell",
      color: "blue",
      description: "Awaiting acceptance",
    },
    {
      title: "In Preparation",
      value: preparingOrders.length,
      icon: "bi-fire",
      color: "purple",
      description: "Currently cooking",
    },
    {
      title: "Completed",
      value: orders.filter((order) => order.orderStatus === "COMPLETED")
        .length,
      icon: "bi-check2-circle",
      color: "green",
      description: "Successfully delivered",
    },
  ];

  return (
    <div className="ro-dashboard">
      {/* Hero header */}
      <header className="ro-hero">
        <div className="ro-hero-text">
          <div className="ro-eyebrow">
            <span className="ro-live-dot"></span>
            Live kitchen view
          </div>

          <h1>Orders Dashboard</h1>

          <p>Manage incoming orders and keep your kitchen running smoothly.</p>
        </div>

        <button className="ro-refresh" onClick={fetchOrders}>
          <i className="bi bi-arrow-clockwise"></i>
          Refresh
        </button>
      </header>

      <div className="ro-body">
        {/* Stats */}
        <section className="ro-stats">
          {stats.map((stat) => (
            <div className={`ro-stat-card ${stat.color}`} key={stat.title}>
              <div className="ro-stat-top">
                <span className={`ro-stat-icon ${stat.color}`}>
                  <i className={`bi ${stat.icon}`}></i>
                </span>
                <h2>{stat.value}</h2>
              </div>

              <h4>{stat.title}</h4>
              <p>{stat.description}</p>
            </div>
          ))}
        </section>

        {/* Orders Section */}
        <section className="ro-orders-section">
          <div className="ro-section-heading">
            <div>
              <h2>Your Orders</h2>
              <p>View and manage all your restaurant orders.</p>
            </div>

            <div className="ro-order-total">
              <strong>{filteredOrders.length}</strong>
              <span>{filteredOrders.length === 1 ? "order" : "orders"}</span>
            </div>
          </div>

          {/* Filters */}
          <div className="ro-filter-wrapper">
            <div className="ro-filters">
              {filters.map((filterOption) => (
                <button
                  key={filterOption}
                  className={
                    filter === filterOption ? "ro-filter active" : "ro-filter"
                  }
                  onClick={() => setFilter(filterOption)}
                >
                  {formatStatus(filterOption)}
                  <em>{countFor(filterOption)}</em>
                </button>
              ))}
            </div>
          </div>

          {/* Orders */}
          <div className="ro-order-list">
            {filteredOrders.map((order) => (
              <article
                key={order._id}
                className={`ro-order-card ${getStatusClass(order.orderStatus)}`}
                onClick={() =>
                  navigate(`/restaurant-orders/orders/${order._id}`)
                }
              >
                {/* Card Header */}
                <div className="ro-card-header">
                  <div className="ro-order-identity">
                    <div className="ro-order-icon">
                      <i className="bi bi-bag-check"></i>
                    </div>

                    <div>
                      <span className="ro-muted-label">Order ID</span>
                      <h3>#{order._id}</h3>
                    </div>
                  </div>

                  <span
                    className={`ro-status ${getStatusClass(order.orderStatus)}`}
                  >
                    <span></span>
                    {formatStatus(order.orderStatus)}
                  </span>
                </div>

                {/* Customer */}
                <div className="ro-customer">
                  <div className="ro-avatar">
                    <i className="bi bi-person-fill"></i>
                  </div>

                  <div>
                    <span className="ro-muted-label">Customer</span>
                    <h4>{order.customerName || "Customer"}</h4>
                  </div>
                </div>

                {/* Items */}
                <div className="ro-items">
                  <div className="ro-items-heading">
                    <i className="bi bi-basket2"></i>
                    <span>Order items</span>
                  </div>

                  {order.items?.length ? (
                    <div className="ro-chips">
                      {order.items.map((item, index) => (
                        <span className="ro-chip" key={index}>
                          {item.image ? (
                            <img
                              className="ro-chip-img"
                              src={item.image}
                              alt={item.name || "Item"}
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <span className="ro-chip-img ro-chip-fallback">
                              <i className="bi bi-egg-fried"></i>
                            </span>
                          )}
                          {item.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p>No items</p>
                  )}
                </div>

                {/* Footer */}
                <div className="ro-card-footer">
                  <div>
                    <span className="ro-muted-label">Order total</span>
                    <h3>₹{order.totalAmount}</h3>
                  </div>

                  <button className="ro-view-btn">
                    View details
                    <i className="bi bi-arrow-up-right"></i>
                  </button>
                </div>
              </article>
            ))}

            {filteredOrders.length === 0 && (
              <div className="ro-empty">
                <div className="ro-empty-icon">
                  <i className="bi bi-receipt"></i>
                </div>

                <h3>No orders found</h3>
                <p>There are currently no orders in this category.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}