import { useEffect } from "react";
import { useRestaurantOwner } from "../../../context/RestaurantOwnerContext";
import { useParams } from "react-router-dom";
import Button from "@mui/material/Button";
import axios from "axios";

export default function RestaurantOrderDetail() {
  const { orders, fetchOrders } = useRestaurantOwner();
  const { orderId } = useParams();
  const formatDate = (iso) =>
    new Date(iso).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  console.log("order id is", orderId);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  console.log(orders);
  const order = orders.find((o) => String(o._id) === orderId);
  console.log("order is : ", order);
  if (!order) {
    return <div>Loading order...</div>;
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
      console.log("order got cancelled");
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
      console.log("order got accepted ");
    } catch (error) {
      console.error(
        "accept order failed:",
        error.response?.data || error.message,
      );
    }
  };

  return (
    <div>
      <h1>Order Detail</h1>
      <p>orderId :#{order._id}</p>
      <p>{formatDate(order.createdAt)}</p>
      <p>Customer :{order.deliveryAddress.fullName}</p>
      <p>delivery Address</p>
      <p>
        <b>{order.deliveryAddress.landmark}</b>
        <br />
        {order.deliveryAddress.street}
        <br />
        {order.deliveryAddress.postalCode}
      </p>

      <span>
        <p>Estimated time:</p>
        <b>{order.estimatedDeliveryTime}</b>
      </span>
      <span>
        <p>Payment </p>
        <b>{order.paymentMethod}</b>
      </span>
      <span>
        <p>Payment Status </p>
        <b>{order.paymentStatus}</b>
      </span>
      <span>
        <p>Distance</p>
        <b>{}</b> {/* do it later  */}
      </span>
      <hr />
      <div>
        {order.items.map((item, index) => (
          <div key={item._id || index} className="ro-order-item">
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

            <span>
              {item.name} &nbsp; x &nbsp; {item.quantity}
            </span>
          </div>
        ))}
      </div>
      <hr />
      <div>
        {order.orderStatus == "PLACED" ? (
          <div>
            <Button onClick={handleAcceptOrder}>Accept</Button>
            <Button onClick={handleCancelOrder}>Cancel </Button>
          </div>
        ) : (
          <div>
            <h1>{order.orderStatus}</h1>
          </div>
        )}
      </div>
    </div>
  );
}
