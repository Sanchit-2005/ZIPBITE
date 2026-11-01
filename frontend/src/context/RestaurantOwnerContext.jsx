import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import axios from "axios";

const RestaurantOwnerContext = createContext();

export function RestaurantOwnerProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setOrders(response.data.orders || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({ orders, loading, error, fetchOrders, setOrders }),
    [orders, loading, error, fetchOrders],
  );

  return (
    <RestaurantOwnerContext.Provider value={value}>
      {children}
    </RestaurantOwnerContext.Provider>
  );
}

export function useRestaurantOwner() {
  return useContext(RestaurantOwnerContext);
}
