import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Heart, Loader, MessageCircle, Trash2, UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import * as api from "../lib/api";

const icons = {
  like: <Heart className="h-5 w-5 text-red-500" />,
  comment: <MessageCircle className="h-5 w-5 text-blue-500" />,
  follow: <UserPlus className="h-5 w-5 text-green-500" />,
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadNotifications() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const data = await api.getNotifications();
        if (mounted) setNotifications(data.notifications || []);
      } catch (requestError) {
        if (mounted) setError(requestError.message || "Failed to load notifications");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadNotifications();
    return () => {
      mounted = false;
    };
  }, [user]);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 pt-16">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold">Sign in to view notifications</h2>
          <Button onClick={() => navigate("/signin")}>Sign In</Button>
        </div>
      </div>
    );
  }

  const markAsRead = async (notificationId) => {
    try {
      await api.markNotificationAsRead(notificationId);
      setNotifications((current) => current.map((notification) => (
        notification._id === notificationId ? { ...notification, read: true } : notification
      )));
    } catch (requestError) {
      setError(requestError.message || "Unable to mark notification as read");
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await api.deleteNotification(notificationId);
      setNotifications((current) => current.filter(({ _id }) => _id !== notificationId));
    } catch (requestError) {
      setError(requestError.message || "Unable to delete notification");
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.markAllNotificationsAsRead();
      setNotifications((current) => current.map((notification) => ({ ...notification, read: true })));
    } catch (requestError) {
      setError(requestError.message || "Unable to update notifications");
    }
  };

  const clearAll = async () => {
    try {
      await api.clearAllNotifications();
      setNotifications([]);
    } catch (requestError) {
      setError(requestError.message || "Unable to clear notifications");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-16">
        <Loader className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Notifications</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Stay updated with your activity</p>
        </div>
        {notifications.some(({ read }) => !read) && (
          <Button variant="outline" size="sm" onClick={markAllAsRead} className="gap-2">
            <Check className="h-4 w-4" /> Mark all as read
          </Button>
        )}
      </div>

      {error && <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {notifications.length === 0 ? (
        <Card className="py-10 text-center">
          <CardContent>
            <p className="text-slate-500">No notifications yet</p>
            <Button variant="outline" onClick={() => navigate("/home")} className="mt-4">Back to Feed</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const actor = notification.actorId;
            return (
              <Card key={notification._id} className={!notification.read ? "border-blue-200 bg-blue-50 dark:bg-blue-950/20" : ""}>
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                  <span className="shrink-0">{icons[notification.type]}</span>
                  <button type="button" className="min-w-0 flex-1 text-left" onClick={() => actor && navigate(`/profile/${actor._id}`)}>
                    <div className="flex items-center gap-3">
                      <img src={actor?.Photo || "/avatar.png"} alt={actor?.name || "User"} className="h-10 w-10 shrink-0 rounded-full object-cover" />
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{actor?.name || "Someone"}</p>
                        <p className="truncate text-sm text-slate-500">@{actor?.userName || "user"}</p>
                      </div>
                    </div>
                    <p className="mt-2 break-words text-sm">{notification.message}</p>
                    <p className="mt-1 text-xs text-slate-500">{new Date(notification.createdAt).toLocaleString()}</p>
                  </button>
                  <div className="flex shrink-0 justify-end gap-2">
                    {!notification.read && (
                      <Button variant="ghost" size="icon" aria-label="Mark as read" onClick={() => markAsRead(notification._id)}>
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" aria-label="Delete notification" onClick={() => deleteNotification(notification._id)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          <div className="pt-3 text-center">
            <Button variant="outline" onClick={clearAll} className="text-red-600">Clear all notifications</Button>
          </div>
        </div>
      )}
    </main>
  );
}
