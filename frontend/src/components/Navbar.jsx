import { useState, useEffect } from "react";
import {
  Home,
  LogOut,
  Menu,
  PlusSquare,
  UserRound,
  X,
  Bell,
  Compass,
  MessageCircle,
  Settings,
} from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SearchUsers from "./SearchUsers";
import { Button } from "./ui/Button";
import * as api from "../lib/api";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const navigate = useNavigate();
  const close = () => setOpen(false);

  useEffect(() => {
    if (!user) return;

    const fetchCounts = async () => {
      try {
        const [notifData, msgData] = await Promise.all([
          api.getUnreadNotificationCount(),
          api.getUnreadMessageCount(),
        ]);
        setNotificationCount(notifData.count || 0);
        setMessageCount(msgData.count || 0);
      } catch (err) {
        console.error("Error fetching counts:", err);
      }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const signOut = () => {
    logout();
    close();
    navigate("/signin", { replace: true });
  };

  const mobileNavItems = [
    { to: "/home", label: "Home", icon: Home },
    { to: "/explore", label: "Explore", icon: Compass },
    { to: "/create-post", label: "Create", icon: PlusSquare },
    { to: "/messages", label: "Messages", icon: MessageCircle },
    { to: "/notifications", label: "Alerts", icon: Bell },
    { to: "/profile", label: "Profile", icon: UserRound },
  ];

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            to={user ? "/home" : "/"}
            className="flex flex-shrink-0 items-center gap-2 text-slate-900 dark:text-white"
          >
            <img
              src="/insta02.png"
              alt="insta.X logo"
              className="h-9 w-9 rounded-xl border border-slate-200 bg-white object-cover shadow-sm"
            />
            <span className="font-display text-2xl font-bold tracking-tight">
              insta<span className="text-[#ee5c47]">.</span>X
            </span>
          </Link>

          {user && (
            <div className="hidden md:flex flex-1 max-w-xs lg:max-w-md">
              <SearchUsers />
            </div>
          )}

          {user && (
            <nav className={`${open ? "absolute left-0 right-0 top-16 flex" : "hidden"} md:top-0 w-full md:w-auto flex-col gap-1 border-b border-slate-200 bg-white p-4 md:static md:flex md:flex-row md:items-center md:border-0 md:bg-transparent md:p-0 md:gap-2`}>
              <NavLink
                onClick={close}
                to="/home"
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-3 py-2 transition-colors ${
                    isActive
                      ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
                      : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
                  }`
                }
              >
                <Home size={18} />
                <span className="md:hidden lg:inline">Home</span>
              </NavLink>
              <NavLink
                onClick={close}
                to="/explore"
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-3 py-2 transition-colors ${
                    isActive
                      ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
                      : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
                  }`
                }
              >
                <Compass size={18} />
                <span className="md:hidden lg:inline">Explore</span>
              </NavLink>
              <NavLink
                onClick={close}
                to="/create-post"
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-3 py-2 transition-colors ${
                    isActive
                      ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
                      : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
                  }`
                }
              >
                <PlusSquare size={18} />
                <span className="md:hidden lg:inline">Create</span>
              </NavLink>
              <NavLink
                onClick={close}
                to="/messages"
                className={({ isActive }) =>
                  `relative flex items-center gap-2 rounded-lg px-3 py-2 transition-colors ${
                    isActive
                      ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
                      : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
                  }`
                }
              >
                <MessageCircle size={18} />
                <span className="md:hidden lg:inline">Messages</span>
                {messageCount > 0 && (
                  <span className="absolute right-0 top-0 flex h-5 min-w-5 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
                    {messageCount}
                  </span>
                )}
              </NavLink>
              <NavLink
                onClick={close}
                to="/profile"
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-3 py-2 transition-colors ${
                    isActive
                      ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
                      : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
                  }`
                }
              >
                <UserRound size={18} />
                <span className="md:hidden lg:inline">Profile</span>
              </NavLink>
              <button
                onClick={signOut}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 md:hidden"
              >
                <LogOut size={18} />
                Log out
              </button>
            </nav>
          )}

          <div className="flex items-center gap-2">
            {user && (
              <>
                <div className="relative hidden md:block">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate("/notifications")}
                  >
                    <Bell size={18} />
                  </Button>
                  {notificationCount > 0 && (
                    <span className="absolute right-0 top-0 inline-flex h-5 w-5 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-red-600 text-xs font-bold leading-none text-white">
                      {notificationCount}
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={signOut}
                  className="hidden md:inline-flex text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <LogOut size={16} className="mr-1" />
                  Log out
                </Button>
              </>
            )}

            {!user && (
              <Link
                to="/signin"
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                Sign in
              </Link>
            )}

            {user && (
              <>
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 md:hidden"
                  onClick={() => navigate("/profile")}
                  aria-label="Open settings"
                >
                  <Settings size={20} />
                </button>
                <button
                  type="button"
                  className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 md:hidden"
                  onClick={() => setOpen(!open)}
                  aria-label="Toggle menu"
                  aria-expanded={open}
                >
                  {open ? <X size={24} /> : <Menu size={24} />}
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {user && (
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 md:hidden">
          <div className="mx-auto grid max-w-md grid-cols-6 gap-1 px-2 py-2">
            {mobileNavItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `relative flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[10px] font-medium transition-colors ${
                    isActive
                      ? "text-[#ee5c47]"
                      : "text-slate-500 dark:text-slate-400"
                  }`
                }
              >
                <div className="relative">
                  <Icon size={18} />
                  {to === "/notifications" && notificationCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-bold text-white">
                      {notificationCount > 9 ? "9+" : notificationCount}
                    </span>
                  )}
                  {to === "/messages" && messageCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-bold text-white">
                      {messageCount > 9 ? "9+" : messageCount}
                    </span>
                  )}
                </div>
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </>
  );
}
