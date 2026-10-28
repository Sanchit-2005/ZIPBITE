import { createContext, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import httpStatus from "http-status-codes";

const RestaurantOwnerContext = createContext();
export function RestaurantOwnerProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  return (
    <RestaurantOwnerContext.Provider
      value={{
        orders,
        setOrders,
        loading,
        setLoading,
        error,
        setError,
      }}
    >
      {children}
    </RestaurantOwnerContext.Provider>
  );
}
export function useRestaurantOwner() {
  return useContext(RestaurantOwnerContext);
}
