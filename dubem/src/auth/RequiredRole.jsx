import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";

export default function RequireRole({ roles, children }) {
  const { role } = useAuth();
  const location = useLocation();

  if (role === "guest") {
    return <Navigate to="/signup" replace state={{ from: location }} />;
  }
  if (!roles.includes(role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}