import { Outlet } from "react-router-dom";


export default function PublicRoute() {
  // This route is accessible to everyone, including non-logged-in users
  return <Outlet />;
}
