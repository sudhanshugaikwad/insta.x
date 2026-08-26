import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PublicRoute() {
  // This route is accessible to everyone, including non-logged-in users
  return <Outlet />;
}
