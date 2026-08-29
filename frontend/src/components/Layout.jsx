import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";

export default function Layout({ children }) {
  const location = useLocation();
  const hideNavbar = location.pathname === "/";

  return (
    <>
      {!hideNavbar && <Navbar />}
      <main className={`min-h-screen bg-slate-50 pb-24 dark:bg-slate-950 md:pb-0 ${hideNavbar ? "pt-0" : "pt-16"}`}>
        <div className="w-full">
          {children}
        </div>
      </main>
    </>
  );
}
