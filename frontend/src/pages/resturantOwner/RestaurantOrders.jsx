import { useRestaurantOwner } from "../../context/RestaurantOwnerContext";
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

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
    [orders],
  );

  const preparingOrders = useMemo(
    () => orders.filter((order) => order.orderStatus === "PREPARING"),
    [orders],
  );

  const filteredOrders = useMemo(
    () =>
      orders.filter(
        (order) => filter === "ALL" || order.orderStatus === filter,
      ),
    [orders, filter],
  );

  return (
    <div>
      <h1>Restaurant Orders</h1>

      <button onClick={fetchOrders}>Refresh</button>

      <h2>New Orders: {newOrders.length}</h2>
      <h2>Preparing Orders: {preparingOrders.length}</h2>

      <h2>
        Ready for Pickup:
        {
          orders.filter((order) => order.orderStatus === "READY_FOR_PICKUP")
            .length
        }
      </h2>

      <h2>
        Out for Delivery:
        {
          orders.filter((order) => order.orderStatus === "OUT_FOR_DELIVERY")
            .length
        }
      </h2>

      <h2>
        Completed Orders:
        {orders.filter((order) => order.orderStatus === "COMPLETED").length}
      </h2>

      <div>
        {filters.map((filterOption) => (
          <div key={filterOption}>
            <button key={filterOption} onClick={() => setFilter(filterOption)}>
              {filterOption}
            </button>
          </div>
        ))}
      </div>

      <h3>Current Filter: {filter}</h3>

      <div>
        {filteredOrders.map((order) => (
          <div
            key={order._id}
            onClick={() => navigate(`/restaurant-orders/orders/${order._id}`)}
            style={{ cursor: "pointer" }}
          >
            <h3>Order ID: {order._id}</h3>
            <p>Customer Name: {order.customerName}</p>
            <p>Order Status: {order.orderStatus}</p>

            <p>
              Order Items:{" "}
              {order.items?.map((item) => item.name).join(", ") || "No items"}
            </p>

            <p>Order Total: ₹{order.totalAmount}</p>
            <hr />
          </div>
        ))}

        {filteredOrders.length === 0 && <p>No orders found for this filter.</p>}
      </div>
    </div>
  );
}
