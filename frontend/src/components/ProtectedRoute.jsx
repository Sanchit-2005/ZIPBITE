import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children, restaurantOnly = false }) {
  const location = useLocation();
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  if (restaurantOnly) {
    const savedUser = localStorage.getItem("userData");
    const user = savedUser ? JSON.parse(savedUser) : null;

    if (user?.role !== "restaurant") {
      return <Navigate to="/home" replace />;
    }
  }

  return children;
}
