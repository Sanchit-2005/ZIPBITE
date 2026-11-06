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
  const [ownerDetail, setOwnerDetail] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please log in.");
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

  const fetchOwnerInfo = useCallback(async () => {
    try {
      console.log("currently i am at fetchInfo");
      const token = localStorage.getItem("token");

      if (!token) return;

      const response = await axios.get(
        "http://localhost:8000/apiV4/restaurant-owner/ownerInfo",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      console.log("owner info is :", response.data.restaurant);

      setOwnerDetail(response.data.restaurant);
    } catch (error) {
      console.error("Error fetching owner info:", error);
    }
  }, []);

  const value = useMemo(
    () => ({
      orders,
      ownerDetail,
      loading,
      error,
      fetchOrders,
      fetchOwnerInfo,
      setOrders,
    }),
    [orders, ownerDetail, loading, error, fetchOrders, fetchOwnerInfo],
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
