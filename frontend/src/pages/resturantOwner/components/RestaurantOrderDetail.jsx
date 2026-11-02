import { useEffect } from "react";
import { useRestaurantOwner } from "../../../context/RestaurantOwnerContext";
import { useParams } from "react-router-dom";
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
        <b>{}</b>   {/* do it later  */}
      </span>
      <hr />
    </div>
  );
}
