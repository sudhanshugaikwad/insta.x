import { useState } from "react";
import { Home, LogOut, Menu, PlusSquare, UserRound, X } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const close = () => setOpen(false);
  const signOut = () => {
    logout();
    close();
    navigate("/signin", { replace: true });
  };
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-stone-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          to={user ? "/home" : "/signin"}
          className="font-display text-2xl font-bold tracking-tight text-ink"
        >
          insta<span className="text-coral">.</span>X
        </Link>
        {user && (
          <nav
            className={`${open ? "absolute left-0 top-16 flex" : "hidden"} w-full flex-col gap-1 border-b border-stone-200 bg-white p-4 sm:static sm:flex sm:w-auto sm:flex-row sm:items-center sm:border-0 sm:bg-transparent sm:p-0`}
          >
            <NavLink onClick={close} to="/home" className="nav-item">
              <Home size={18} />
              Home
            </NavLink>
            <NavLink onClick={close} to="/create-post" className="nav-item">
              <PlusSquare size={18} />
              Create
            </NavLink>
            <NavLink onClick={close} to="/profile" className="nav-item">
              <UserRound size={18} />
              Profile
            </NavLink>
            <button onClick={signOut} className="nav-item text-coral">
              <LogOut size={18} />
              Log out
            </button>
          </nav>
        )}
        {user && (
          <button
            className="rounded-lg p-2 text-ink sm:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X /> : <Menu />}
          </button>
        )}
        {!user && (
          <Link
            to="/signin"
            className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white"
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
