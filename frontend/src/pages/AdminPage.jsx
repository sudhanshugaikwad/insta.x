import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Eye,
  FileText,
  LayoutDashboard,
  Lock,
  LogOut,
  Mail,
  Pencil,
  Search,
  Settings,
  ShieldCheck,
  Trash2,
  UserCog,
  Users,
  UserX,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import * as api from "../lib/api";

export default function AdminPage() {
  const navigate = useNavigate();
  const [data, setData] = useState({ users: [], posts: [], counts: {} });
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [search, setSearch] = useState("");
  const [admin, setAdmin] = useState(() => JSON.parse(localStorage.getItem("admin") || "null"));
  const [loginForm, setLoginForm] = useState({ userName: "", password: "" });
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [usernameStatus, setUsernameStatus] = useState({
    checking: false,
    available: null,
    message: "",
  });

  const loadDashboard = async () => {
    try {
      const result = await api.getAdminOverview();
      setData(result);
      if (!selectedUserId && result.users?.length) {
        setSelectedUserId(result.users[0]._id);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!admin) {
      setLoading(false);
      return undefined;
    }

    loadDashboard();
    const interval = setInterval(loadDashboard, 15000);
    return () => clearInterval(interval);
  }, [admin]);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return data.users;

    return data.users.filter((user) => {
      const combined = `${user.name} ${user.userName} ${user.email}`.toLowerCase();
      return combined.includes(term);
    });
  }, [data.users, search]);

  const selectedUser = useMemo(
    () => data.users.find((user) => user._id === selectedUserId) || filteredUsers[0] || null,
    [data.users, filteredUsers, selectedUserId]
  );

  useEffect(() => {
    if (selectedUser && selectedUserId !== selectedUser._id) {
      setSelectedUserId(selectedUser._id);
    }
  }, [selectedUser, selectedUserId]);

  useEffect(() => {
    if (!editingUser) {
      setUsernameStatus({ checking: false, available: null, message: "" });
      return undefined;
    }

    const username = (editingUser.userName || "").trim();
    if (!username) {
      setUsernameStatus({ checking: false, available: null, message: "" });
      return undefined;
    }

    if (username === data.users.find((user) => user._id === editingUser._id)?.userName) {
      setUsernameStatus({ checking: false, available: true, message: "Current username is still available" });
      return undefined;
    }

    if (username.length < 3 || !/^[a-zA-Z0-9._]+$/.test(username)) {
      setUsernameStatus({
        checking: false,
        available: false,
        message: "Use 3+ characters with letters, numbers, dots, or underscores only",
      });
      return undefined;
    }

    let cancelled = false;
    setUsernameStatus({ checking: true, available: null, message: "Checking username..." });

    const timer = setTimeout(async () => {
      try {
        const result = await api.checkUsernameAvailability(username, editingUser._id);
        if (!cancelled) {
          setUsernameStatus({
            checking: false,
            available: result.available,
            message: result.message,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setUsernameStatus({
            checking: false,
            available: false,
            message: error.message,
          });
        }
      }
    }, 450);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [data.users, editingUser]);

  const login = async (event) => {
    event.preventDefault();
    try {
      const result = await api.adminLogin(loginForm.userName, loginForm.password);
      localStorage.setItem("jwt", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));
      localStorage.setItem("admin", JSON.stringify(result.user));
      setAdmin(result.user);
      setLoading(true);
      navigate("/admin", { replace: true });
    } catch (error) {
      toast.error(error.message);
    }
  };

  const logout = () => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("admin");
    setAdmin(null);
    setSelectedUserId("");
  };

  const updateUser = async (event) => {
    event.preventDefault();

    if (!editingUser) return;
    if (usernameStatus.available === false) {
      toast.error("Please choose a different username for this account.");
      return;
    }

    try {
      const result = await api.updateAdminUser(editingUser._id, editingUser);
      setData((current) => ({
        ...current,
        users: current.users.map((user) =>
          user._id === result.user._id ? result.user : user
        ),
      }));
      setEditingUser(null);
      setSelectedUserId(result.user._id);
      toast.success("User updated successfully");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const toggleSuspension = async (user) => {
    setSavingId(user._id);
    try {
      const result = await api.updateAdminUser(user._id, { suspended: !user.suspended });
      setData((current) => ({
        ...current,
        users: current.users.map((item) =>
          item._id === user._id ? result.user : item
        ),
      }));
      toast.success(result.user.suspended ? "User suspended" : "User restored");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSavingId("");
    }
  };

  const deleteUser = async (userId) => {
    const targetUser = data.users.find((user) => user._id === userId);
    if (!window.confirm(`Delete ${targetUser?.name || "this user"} and all of their posts?`)) return;

    try {
      await api.deleteAdminUser(userId);
      setData((current) => ({
        ...current,
        users: current.users.filter((user) => user._id !== userId),
        posts: current.posts.filter((post) => post.postedBy?._id !== userId),
      }));

      if (selectedUserId === userId) {
        const remainingUser = data.users.find((user) => user._id !== userId);
        setSelectedUserId(remainingUser?._id || "");
      }

      toast.success("User deleted successfully");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const deletePost = async (postId) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await api.deleteAdminPost(postId);
      setData((current) => ({
        ...current,
        posts: current.posts.filter((post) => post._id !== postId),
      }));
      toast.success("Post deleted successfully");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const stats = [
    {
      label: "Total users",
      value: data.counts.users || 0,
      icon: Users,
      tone: "bg-pink-50 text-pink-600 dark:bg-pink-500/10 dark:text-pink-300",
    },
    {
      label: "Active users",
      value: data.users.filter((user) => !user.suspended).length,
      icon: CheckCircle2,
      tone: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
    },
    {
      label: "Suspended",
      value: data.users.filter((user) => user.suspended).length,
      icon: Lock,
      tone: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300",
    },
    {
      label: "Total posts",
      value: data.counts.posts || 0,
      icon: ShieldCheck,
      tone: "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300",
    },
  ];

  const adminTabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "users", label: "Users", icon: Users },
    { id: "posts", label: "Posts", icon: FileText },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  if (!admin) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center justify-center px-4 py-12">
        <Card className="w-full border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-950">
          <CardContent className="p-6 sm:p-8">
            <div className="mb-6 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-pink-500">Admin access</p>
              <h1 className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">Sign in</h1>
            </div>

            <form onSubmit={login} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Username</label>
                <Input
                  placeholder="admin username"
                  value={loginForm.userName}
                  onChange={(event) => setLoginForm({ ...loginForm, userName: event.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Password</label>
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={loginForm.password}
                  onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })}
                  required
                />
              </div>

              <Button type="submit" className="w-full bg-gradient-to-r from-[#f16c57] via-[#ee5c47] to-[#e6533d] text-white shadow-lg shadow-[#ee5c47]/25 hover:brightness-110">Access dashboard</Button>
            </form>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-pink-500 border-t-transparent" />
          <span>Loading dashboard...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-8">
      <header className="space-y-5 rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/80 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/insta02.png"
              alt="insta.X logo"
              className="h-11 w-11 rounded-2xl border border-slate-200 bg-white object-cover shadow-sm"
            />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#ee5c47]">Control center</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">Admin Dashboard</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              aria-label="Open admin settings"
              onClick={() => setActiveTab("settings")}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 transition hover:border-[#ee5c47] hover:bg-[#fff1ee] hover:text-[#c84f3d] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 md:hidden"
            >
              <Settings className="h-5 w-5" />
            </button>

            <Button
              variant="outline"
              onClick={logout}
              className="w-full border-[#f6b7ac] bg-white text-[#1e1c1a] hover:border-[#ee5c47] hover:bg-[#fff1ee] hover:text-[#c84f3d] sm:w-auto"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </Button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(({ label, value, icon: Icon, tone }) => (
            <Card key={label} className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
                  <strong className="mt-2 block text-2xl text-slate-900 dark:text-white">{value}</strong>
                </div>
                <div className={`rounded-xl p-2.5 ${tone}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </header>

      <nav className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-950 md:hidden">
        {adminTabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`flex min-w-[86px] flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition ${
              activeTab === id
                ? "bg-[#fff1ee] text-[#c84f3d]"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </nav>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_360px]">
        <div className={`${activeTab === "users" || activeTab === "overview" ? "block" : "hidden md:block"}`}>
          <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <CardContent className="p-4 sm:p-5">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">User Management</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">View, search, update, and manage all accounts</p>
                </div>
                <div className="relative w-full max-w-sm">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search users..."
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-600 dark:border-slate-800 dark:text-slate-300">
                      <th className="p-3 font-medium">User</th>
                      <th className="p-3 font-medium">Email</th>
                      <th className="p-3 font-medium">Role</th>
                      <th className="p-3 font-medium">Status</th>
                      <th className="p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-slate-500 dark:text-slate-400">
                          No users match your search.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user._id} className="border-b border-slate-200 last:border-0 dark:border-slate-800">
                          <td className="p-3 align-top">
                            <button type="button" onClick={() => setSelectedUserId(user._id)} className="text-left">
                              <div className="font-semibold text-slate-900 dark:text-white">{user.name}</div>
                              <div className="text-xs text-slate-500">@{user.userName}</div>
                            </button>
                          </td>
                          <td className="p-3 align-top text-slate-600 dark:text-slate-300">{user.email}</td>
                          <td className="p-3 align-top">
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                              {user.role || "user"}
                            </span>
                          </td>
                          <td className="p-3 align-top">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                user.suspended
                                  ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
                                  : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                              }`}
                            >
                              {user.suspended ? "Suspended" : "Active"}
                            </span>
                          </td>
                          <td className="p-3 align-top">
                            <div className="flex flex-wrap gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedUserId(user._id)}
                                className="border-[#f7c6bb] text-slate-700 hover:border-[#ee5c47] hover:bg-[#fff1ee] hover:text-[#c84f3d]"
                              >
                                <Eye className="mr-1 h-3.5 w-3.5" />
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingUser({ ...user })}
                                className="border-[#f7c6bb] text-slate-700 hover:border-[#ee5c47] hover:bg-[#fff1ee] hover:text-[#c84f3d]"
                              >
                                <Pencil className="mr-1 h-3.5 w-3.5" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant={user.suspended ? "secondary" : "outline"}
                                onClick={() => toggleSuspension(user)}
                                disabled={savingId === user._id}
                                className={user.suspended ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "border-[#f7c6bb] text-slate-700 hover:border-[#ee5c47] hover:bg-[#fff1ee] hover:text-[#c84f3d]"}
                              >
                                <UserX className="mr-1 h-3.5 w-3.5" />
                                {user.suspended ? "Restore" : "Suspend"}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteUser(user._id)}
                                className="bg-[#e6533d] text-white hover:bg-[#d94934]"
                              >
                                <Trash2 className="mr-1 h-3.5 w-3.5" />
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className={`${activeTab === "posts" || activeTab === "overview" ? "block" : "hidden md:block"} space-y-6`}>
          {selectedUser ? (
            <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <CardContent className="p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-400 text-sm font-semibold text-white">
                      {selectedUser.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{selectedUser.name}</h3>
                      <p className="text-xs text-slate-500">@{selectedUser.userName}</p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                      selectedUser.suspended
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                    }`}
                  >
                    {selectedUser.suspended ? "Suspended" : "Active"}
                  </span>
                </div>

                <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-pink-500" />
                    <span>{selectedUser.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserCog className="h-4 w-4 text-pink-500" />
                    <span>Role: {selectedUser.role || "user"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-pink-500" />
                    <span>Followers: {selectedUser.followers?.length || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-pink-500" />
                    <span>Following: {selectedUser.following?.length || 0}</span>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900">
                    <p className="mb-1 text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Bio</p>
                    <p className="text-sm text-slate-700 dark:text-slate-200">
                      {selectedUser.bio || "No bio provided yet."}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  <Button
                    variant="outline"
                    onClick={() => setEditingUser({ ...selectedUser })}
                    className="w-full border-[#f7c6bb] text-slate-700 hover:border-[#ee5c47] hover:bg-[#fff1ee] hover:text-[#c84f3d]"
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit details
                  </Button>
                  <Button
                    onClick={() => toggleSuspension(selectedUser)}
                    className="w-full bg-gradient-to-r from-[#f16c57] via-[#ee5c47] to-[#e6533d] text-white shadow-lg shadow-[#ee5c47]/25 hover:brightness-110"
                    disabled={savingId === selectedUser._id}
                  >
                    {selectedUser.suspended ? "Reactivate" : "Suspend account"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}

          <Card className={`${activeTab === "posts" ? "block" : "hidden md:block"} border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950`}>
            <CardContent className="p-4 sm:p-5">
              <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Recent posts</h2>
              <div className="space-y-3">
                {data.posts.slice(0, 4).map((post) => (
                  <div key={post._id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                        @{post.postedBy?.userName || "unknown"}
                      </p>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deletePost(post._id)}
                        className="h-8 px-2"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <p className="line-clamp-2 text-xs text-slate-600 dark:text-slate-300">{post.body || "No caption"}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </aside>
      </section>

      <div className={`${activeTab === "settings" ? "block" : "hidden md:block"}`}>
        <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <CardContent className="p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-[#fff1ee] p-2 text-[#c84f3d]">
                <Settings className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Admin Settings</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Preferences and account controls</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-2 flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <ShieldCheck className="h-4 w-4 text-[#ee5c47]" />
                  <h3 className="font-medium">Access Security</h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">Admin access is controlled and protected by secure session validation.</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-2 flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <BarChart3 className="h-4 w-4 text-[#ee5c47]" />
                  <h3 className="font-medium">Monitoring</h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">Track platform activity, account health, and content moderation in real time.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {editingUser && (
        <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <CardContent className="p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Edit user details</h2>
              <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>
                Cancel
              </Button>
            </div>

            <form onSubmit={updateUser} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Name</label>
                <Input
                  value={editingUser.name}
                  onChange={(event) => setEditingUser({ ...editingUser, name: event.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Username</label>
                <Input
                  value={editingUser.userName}
                  onChange={(event) => setEditingUser({ ...editingUser, userName: event.target.value })}
                  required
                />
                {editingUser.userName && (
                  <p
                    className={`text-xs ${
                      usernameStatus.available === false
                        ? "text-red-500"
                        : usernameStatus.available === true
                          ? "text-emerald-600"
                          : "text-stone-400"
                    }`}
                  >
                    {usernameStatus.checking ? "Checking username..." : usernameStatus.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Email</label>
                <Input
                  type="email"
                  value={editingUser.email}
                  onChange={(event) => setEditingUser({ ...editingUser, email: event.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Role</label>
                <select
                  value={editingUser.role || "user"}
                  onChange={(event) => setEditingUser({ ...editingUser, role: event.target.value })}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 dark:border-slate-800 dark:bg-slate-950"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Bio</label>
                <textarea
                  value={editingUser.bio || ""}
                  onChange={(event) => setEditingUser({ ...editingUser, bio: event.target.value })}
                  rows={4}
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 dark:border-slate-800 dark:bg-slate-950"
                  placeholder="Tell users about this profile..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Account status</label>
                <select
                  value={editingUser.suspended ? "suspended" : "active"}
                  onChange={(event) => setEditingUser({ ...editingUser, suspended: event.target.value === "suspended" })}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 dark:border-slate-800 dark:bg-slate-950"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <div className="sm:col-span-2 flex flex-wrap gap-3 pt-2">
                <Button type="submit" className="bg-gradient-to-r from-[#f16c57] via-[#ee5c47] to-[#e6533d] text-white shadow-lg shadow-[#ee5c47]/25 hover:brightness-110">Save changes</Button>
                <Button type="button" variant="outline" onClick={() => setEditingUser(null)} className="border-[#f7c6bb] text-slate-700 hover:border-[#ee5c47] hover:bg-[#fff1ee] hover:text-[#c84f3d]">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
