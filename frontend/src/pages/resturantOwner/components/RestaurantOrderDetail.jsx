import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./RestaurantOrderDetail.css";
import { useRestaurantOwner } from "../../../context/RestaurantOwnerContext";

const ORDER_STATUS_CLASS = {
  PLACED: "placed",
  CONFIRMED: "preparing",
  PREPARING: "preparing",
  READY_FOR_PICKUP: "ready",
  OUT_FOR_DELIVERY: "delivery",
  DELIVERED: "completed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  CANCELED: "cancelled",
};

const PAYMENT_STATUS_META = {
  PAID: { className: "is-paid", icon: "bi-check-circle-fill" },
  PENDING: { className: "is-pending", icon: "bi-clock-fill" },
  FAILED: { className: "is-failed", icon: "bi-x-circle-fill" },
  REFUNDED: { className: "is-refunded", icon: "bi-arrow-counterclockwise" },
};

const moneyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
});

const formatMoney = (value) => moneyFormatter.format(Number(value) || 0);

const formatStatus = (status = "") => status.replaceAll("_", " ");

const statusClass = (status = "") => ORDER_STATUS_CLASS[status] || "default";

const formatPlacedAt = (iso) =>
  new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

const formatClock = (iso) =>
  new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

const formatDay = (iso) =>
  new Date(iso).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const getInitials = (name) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase() || "C";

const hideBrokenImage = (event) => {
  event.currentTarget.style.display = "none";
  event.currentTarget.parentElement?.classList.add("is-fallback");
};

export default function RestaurantOrderDetail() {
  const { orders, fetchOrders } = useRestaurantOwner();
  const { orderId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const order = orders.find((candidate) => String(candidate._id) === orderId);

  if (!order) {
    return (
      <div className="rod-page">
        <div className="rod-shell rod-state">
          <div className="rod-card rod-loading">Loading order...</div>
        </div>
      </div>
    );
  }

  const handleCancelOrder = async () => {
    try {
      await axios.patch(
        `http://localhost:8000/apiV4/restaurant-owner/orders/${orderId}/reject`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      await fetchOrders();
    } catch (error) {
      console.error(
        "Cancel order failed:",
        error.response?.data || error.message,
      );
    }
  };

  const handleAcceptOrder = async () => {
    try {
      await axios.patch(
        `http://localhost:8000/apiV4/restaurant-owner/orders/${orderId}/accept`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      await fetchOrders();
    } catch (error) {
      console.error(
        "accept order failed:",
        error.response?.data || error.message,
      );
    }
  };

  const address = order.deliveryAddress || {};
  const items = order.items || [];
  const itemCount = items.reduce(
    (total, item) => total + (Number(item.quantity) || 0),
    0,
  );
  const customerName = address.fullName || "Customer";
  const phoneHref = address.phone
    ? `tel:${String(address.phone).replace(/[^\d+]/g, "")}`
    : null;
  const cityLine = [
    [address.city, address.state].filter(Boolean).join(", "),
    address.postalCode,
  ]
    .filter(Boolean)
    .join(" ");

  const paymentMeta = PAYMENT_STATUS_META[order.paymentStatus] || {
    className: "",
    icon: "bi-circle-fill",
  };

  const estimatedAt = order.estimatedDeliveryTime;

  return (
    <div className="rod-page">
      <div className="rod-shell">
        <button
          type="button"
          className="rod-back"
          onClick={() => navigate("/restaurant-owner/orders")}
        >
          <i className="bi bi-arrow-left" aria-hidden="true"></i>
          Orders
        </button>

        <header className="rod-head">
          <div>
            <h1 className="rod-title">Order details</h1>
            <div className="rod-meta">
              <span className="rod-order-id" title={order._id}>
                #{order._id}
              </span>
              <span className="rod-sep" aria-hidden="true"></span>
              <span>Placed {formatPlacedAt(order.createdAt)}</span>
            </div>
          </div>

          <span className={`rod-status ${statusClass(order.orderStatus)}`}>
            <span aria-hidden="true"></span>
            {formatStatus(order.orderStatus)}
          </span>
        </header>

        <div className="rod-grid">
          <section className="rod-card rod-items" aria-labelledby="rod-items-title">
            <div className="rod-card-head">
              <h2 id="rod-items-title">Ordered items</h2>
              <span className="rod-item-count">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </span>
            </div>

            {items.length === 0 ? (
              <p className="rod-items-empty">No items in this order.</p>
            ) : (
              <table className="rod-table">
                <thead>
                  <tr>
                    <th scope="col">Item</th>
                    <th scope="col">Qty</th>
                    <th scope="col" className="rod-num">
                      Unit price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={`${item.menuItem || item.name || "item"}-${index}`}>
                      <td>
                        <div className="rod-item">
                          <span
                            className={`rod-thumb${item.image ? "" : " is-fallback"}`}
                          >
                            {item.image ? (
                              <img
                                src={item.image}
                                alt=""
                                loading="lazy"
                                onError={hideBrokenImage}
                              />
                            ) : null}
                            <i className="bi bi-egg-fried" aria-hidden="true"></i>
                          </span>
                          <span className="rod-item-name">{item.name}</span>
                        </div>
                      </td>
                      <td className="rod-qty">
                        <span aria-hidden="true">×</span>
                        {item.quantity}
                      </td>
                      <td className="rod-num">{formatMoney(item.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {order.instructions ? (
              <div className="rod-note">
                <i className="bi bi-chat-left-text" aria-hidden="true"></i>
                <div>
                  <span className="rod-note-label">ORDER INSTRUCTIONS</span>
                  <p>{order.instructions}</p>
                </div>
              </div>
            ) : null}
          </section>

          <aside className="rod-card rod-rail" aria-label="Order decision details">
            <section className="rod-rail-section">
              <h3>CUSTOMER</h3>
              <div className="rod-customer">
                <span className="rod-avatar" aria-hidden="true">
                  {getInitials(customerName)}
                </span>
                <div>
                  <div className="rod-customer-name">{customerName}</div>
                  {phoneHref ? (
                    <a className="rod-phone" href={phoneHref}>
                      <i className="bi bi-telephone" aria-hidden="true"></i>
                      {address.phone}
                    </a>
                  ) : null}
                </div>
              </div>
            </section>

            <section className="rod-rail-section">
              <h3>DELIVERY ADDRESS</h3>
              <p className="rod-landmark">
                {address.landmark || "No landmark provided"}
              </p>
              <p className="rod-address">
                {address.street || "No street address"}
                {cityLine ? (
                  <>
                    <br />
                    {cityLine}
                  </>
                ) : null}
              </p>
            </section>

            <section className="rod-rail-section rod-pair">
              <div>
                <h3>ESTIMATED DELIVERY</h3>
                <div className="rod-pair-value">
                  {estimatedAt ? formatClock(estimatedAt) : "Not set"}
                </div>
                {estimatedAt ? (
                  <span className="rod-pair-sub">{formatDay(estimatedAt)}</span>
                ) : null}
              </div>
              <div>
                <h3>PAYMENT</h3>
                <div className="rod-pair-value">{order.paymentMethod}</div>
                <span className={`rod-pair-sub rod-paid ${paymentMeta.className}`}>
                  <i className={`bi ${paymentMeta.icon}`} aria-hidden="true"></i>
                  {order.paymentStatus}
                </span>
              </div>
            </section>

            <section className="rod-rail-section rod-bill">
              <h3>BILL</h3>
              <div className="rod-bill-line">
                <span>Subtotal</span>
                <b>{formatMoney(order.subtotal)}</b>
              </div>
              <div className="rod-bill-line">
                <span>Delivery fee</span>
                <b>{formatMoney(order.deliveryFee)}</b>
              </div>
              <div className="rod-bill-line">
                <span>Tax</span>
                <b>{formatMoney(order.tax)}</b>
              </div>
              <div className="rod-bill-line">
                <span>Discount</span>
                <b>
                  {order.discount
                    ? `−${formatMoney(order.discount)}`
                    : formatMoney(0)}
                </b>
              </div>
              <div className="rod-total">
                <span>Order total</span>
                <strong>{formatMoney(order.totalAmount)}</strong>
              </div>
            </section>

            {order.orderStatus === "PLACED" ? (
              <div className="rod-actions">
                <button
                  type="button"
                  className="rod-accept"
                  onClick={handleAcceptOrder}
                >
                  Accept order
                  <i className="bi bi-check2" aria-hidden="true"></i>
                </button>
                <button
                  type="button"
                  className="rod-cancel"
                  onClick={handleCancelOrder}
                >
                  <i className="bi bi-x-lg" aria-hidden="true"></i>
                  Cancel order
                </button>
              </div>
            ) : (
              <div className="rod-decided">
                <span className="rod-decided-label">ORDER STATUS</span>
                <span className={`rod-status ${statusClass(order.orderStatus)}`}>
                  <span aria-hidden="true"></span>
                  {formatStatus(order.orderStatus)}
                </span>
                {order.deliveredAt ? (
                  <p className="rod-decided-when">
                    Delivered {formatPlacedAt(order.deliveredAt)}
                  </p>
                ) : null}
                {order.cancelledAt ? (
                  <p className="rod-decided-when">
                    Cancelled {formatPlacedAt(order.cancelledAt)}
                  </p>
                ) : null}
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
