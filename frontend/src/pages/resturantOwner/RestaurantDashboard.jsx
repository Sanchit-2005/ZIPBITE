import React, { use, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRestaurantOwner } from "../../context/RestaurantOwnerContext";
import "./RestaurantDashboard.css";
import SalesByCategory from "./SalesByCategory";
import { BarChartBox, PieChartBox } from "./components/Charts";
import axios from "axios";

const statusClass = (status = "") => {
  const s = status.toLowerCase();
  if (s.includes("cancel") || s.includes("fail") || s.includes("reject"))
    return "badge badge--red";
  if (s.includes("deliver") || s.includes("paid") || s.includes("complete"))
    return "badge badge--blue";
  if (s.includes("accept") || s.includes("confirm"))
    return "badge badge--green";
  return "badge badge--purple"; // pending / anything else
};

export default function RestaurantDashboard() {
  const navigate = useNavigate();
  const { orders, loading, error, fetchOrders } = useRestaurantOwner();
  const [monthlySales, setMonthlySales] = useState([]);
  const [toatalCustomers, setTotalCustomers] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [ownerDetail, setOwnerDetail] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const fetchOwnerInfo = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          "http://localhost:8000/apiV4/restaurant-owner/ownerInfo",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        console.log("Owner info:", response.data);
        setOwnerDetail(response.data.restaurant);
      } catch (error) {
        console.error(
          "Error fetching restaurant owner info:",
          error.response?.data || error.message,
        );
      }
    };

    fetchOwnerInfo();
  }, []);

  useEffect(() => {
    const fetchMonthlySales = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          "http://localhost:8000/apiV4/restaurant-owner/orders/monthly-revenue",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setMonthlySales(response.data.monthlySales || []);
      } catch (err) {
        console.error("Error fetching monthly sales:", err);
      }
    };
    fetchMonthlySales();
  }, []);
  useEffect(() => {
    const uniqueCustomers = new Set(
      orders.map((order) => order.customer?._id).filter(Boolean),
    );
    setTotalCustomers(uniqueCustomers.size);
  }, [orders]);

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

  console.log("category Sales: ", categorySales);
  const totalOrders = orders.length;

  const totalRevenue = useMemo(() => {
    return orders.reduce((acc, order) => {
      if (order.paymentStatus === "PAID" && order.orderStatus !== "CANCELED") {
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

  if (loading) return <p className="dash-message">Loading dashboard...</p>;

  if (error) return <p className="dash-message dash-message--error">{error}</p>;

  return (
    <div className="owner-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Restaurant Dashboard</h1>
          <h2>{ownerDetail?.name || "Loading restaurant..."}</h2>
          <h3>{ownerDetail?.owner?.name || ""}</h3>
          <p>{ownerDetail?.owner?.email || ""}</p>
        </div>

        <button
          className="btn-primary"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? "Refreshing..." : "Refresh Orders"}
        </button>
      </div>

      {/* Stat cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon--purple">
            <svg
              viewBox="0 0 24 24"
              width="26"
              height="26"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 8l-9-5-9 5 9 5 9-5z" />
              <path d="M3 8v8l9 5 9-5V8" />
              <path d="M12 13v8" />
            </svg>
          </div>
          <div className="stat-body">
            <span className="stat-label">Total Orders</span>
            <strong className="stat-value">{totalOrders}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon--red">
            <svg
              viewBox="0 0 24 24"
              width="26"
              height="26"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M15 9l-6 6M9 9l6 6" />
            </svg>
          </div>
          <div className="stat-body">
            <span className="stat-label">Canceled Orders</span>
            <strong className="stat-value">{canceledOrders}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon--blue">
            <svg
              viewBox="0 0 24 24"
              width="26"
              height="26"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="4" />
              <path d="M14.5 9.2c-.4-.8-1.4-1.2-2.5-1.2-1.4 0-2.5.7-2.5 1.8s1 1.6 2.5 2 2.5.9 2.5 2-1.1 1.8-2.5 1.8c-1.1 0-2.1-.4-2.5-1.2M12 6.5V8m0 8v1.5" />
            </svg>
          </div>
          <div className="stat-body">
            <span className="stat-label">Total Revenue</span>
            <strong className="stat-value">₹{totalRevenue.toFixed(2)}</strong>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon--blue">
            <svg
              viewBox="0 0 24 24"
              width="26"
              height="26"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="4" />
              <path d="M14.5 9.2c-.4-.8-1.4-1.2-2.5-1.2-1.4 0-2.5.7-2.5 1.8s1 1.6 2.5 2 2.5.9 2.5 2-1.1 1.8-2.5 1.8c-1.1 0-2.1-.4-2.5-1.2M12 6.5V8m0 8v1.5" />
            </svg>
          </div>
          <div className="stat-body">
            <span className="stat-label">Total Customers</span>
            <strong className="stat-value">{toatalCustomers}</strong>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="chart-row">
        <section className="card card--wide">
          <div className="card-head">
            <h2>Monthly Sales</h2>
          </div>
          <div className="chart-body">
            <BarChartBox
              data={(monthlySales || []).map((revenue, index) => ({
                name: new Date(2026, index, 1).toLocaleString("default", {
                  month: "short",
                }),
                revenue,
              }))}
              onSeeMore={() => navigate("/restaurant-owner/orders")}
            />
          </div>
        </section>

        <section className="card">
          <div className="card-head">
            <h2>Sales by Category</h2>
          </div>
          <div className="chart-body">
            <PieChartBox data={categorySales} />
          </div>
        </section>
      </div>

      {/* Recent orders */}
      <section className="card">
        <div className="card-head">
          <h2>Recent Orders</h2>
          <button
            className="btn-primary btn-primary--sm"
            onClick={() => navigate("/restaurant-owner/orders")}
          >
            View All
          </button>
        </div>

        {orders.length === 0 ? (
          <p className="empty-state">No orders available.</p>
        ) : (
          <div className="table-wrap">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer Name</th>
                  <th>Date</th>
                  <th>Total Amount</th>
                  <th>Payment Status</th>
                  <th>Order Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td className="cell-id" title={order._id}>
                      #{String(order._id).slice(-10)}
                    </td>
                    <td>{order.customer?.name || "N/A"}</td>
                    <td>{new Date(order.orderedAt).toLocaleString()}</td>
                    <td>₹{order.totalAmount?.toFixed(2)}</td>
                    <td>
                      <span className={statusClass(order.paymentStatus)}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <span className={statusClass(order.orderStatus)}>
                        {order.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
