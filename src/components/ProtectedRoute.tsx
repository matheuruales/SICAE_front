import { Navigate, Outlet } from "react-router-dom";
import { useSicae } from "../context/SicaeContext";

export function ProtectedRoute() {
  const { user, ready } = useSicae();
  if (!ready) return null;
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
