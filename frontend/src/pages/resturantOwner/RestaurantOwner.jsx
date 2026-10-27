import React from "react";
import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function RestaurantOwner() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState();
  const [loading, setLoading] = useState(true); // true → show spinner until request finishes

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/apiV4/restaurant-owner/orders",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        // Store the fetched orders and stop the loading spinner
        setOrders(response.data.orders);
        setLoading(false);
        console.log("Fetched orders:", response.data.orders);
      } catch (error) {
        console.error(error);
        // Capture the error message and stop the loading spinner
        setError(error?.response?.data?.message ?? "Something went wrong");
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div>
      {loading ? (
        <p>Loading data…</p>
      ) : error ? (
        <p style={{ color: "tomato" }}>{error}</p>
      ) : (
        <>
          <p>Data is fetched!</p>
          <ul>
            {orders.map((order) => (
              <li key={order.id}>{JSON.stringify(order)}</li>
            ))}
          </ul>
        </>
      )}




    </div>
  );
}
