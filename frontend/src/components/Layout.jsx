import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";

export default function Layout({ children }) {
  const location = useLocation();
  const hideNavbar = location.pathname === "/";

  return (
    <>
      {!hideNavbar && <Navbar />}
      <main className={`min-h-screen bg-[#f8fafc] pb-24 md:pb-0 ${hideNavbar ? "pt-0" : "pt-16"}`}>
        <div className="w-full bg-[#f8fafc]">
          {children}
        </div>
      </main>
    </>
  );
}
