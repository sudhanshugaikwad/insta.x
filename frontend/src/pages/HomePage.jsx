import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Flame, Loader, LogIn, Search, TrendingUp, Users } from "lucide-react";
import PostCard from "../components/PostCard";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { useAuth } from "../context/AuthContext";
import { followUser, getAllPosts, getAllUsers, getSuggestedUsers } from "../lib/api";

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const [followingId, setFollowingId] = useState("");

  useEffect(() => {
    async function loadPosts() {
      try {
        setLoading(true);
        const data = await getAllPosts();
        setPosts(Array.isArray(data) ? data : []);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadPosts();
  }, []);

  useEffect(() => {
    let active = true;

    async function loadSuggestedUsers() {
      try {
        setSuggestionsLoading(true);
        const data = user ? await getSuggestedUsers() : await getAllUsers();
        const users = (data.users || []).filter((item) => item._id !== user?._id);

        if (active) {
          setSuggestedUsers(users);
        }
      } catch (error) {
        if (active) {
          toast.error(error.message);
        }
      } finally {
        if (active) {
          setSuggestionsLoading(false);
        }
      }
    }

    loadSuggestedUsers();
    return () => { active = false; };
  }, [user]);

  const handleFollow = async (userId) => {
    if (!user) {
      navigate("/signin");
      return;
    }

    setFollowingId(userId);
    try {
      await followUser(userId);
      setSuggestedUsers((items) => items.filter((item) => item._id !== userId));
      toast.success("User followed");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setFollowingId("");
    }
  };

  const handleUpdatePost = (updatedPost) => {
    setPosts((items) =>
      items.map((item) => (item._id === updatedPost._id ? updatedPost : item))
    );
  };

  const handleRemovePost = (deletedPostId) => {
    setPosts((items) => items.filter((post) => post._id !== deletedPostId));
  };

  const trendingCards = useMemo(
    () => [
      { label: "Design systems", value: "24k" },
      { label: "AI creators", value: "18k" },
      { label: "Remote work", value: "12k" },
      { label: "Travel stories", value: "9k" },
    ],
    []
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center pt-16">
        <div className="flex flex-col items-center gap-4">
          <Loader className="h-8 w-8 animate-spin text-pink-500" />
          <p className="text-slate-600 dark:text-slate-400">Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8 md:mb-12">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pink-500">
          Your feed
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          Good moments, shared.
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Stay connected with what is happening around you
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          {posts.length === 0 ? (
            <Card className="border-slate-200 bg-white py-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <CardContent>
                {user ? (
                  <>
                    <Users className="mx-auto mb-4 h-12 w-12 text-slate-400" />
                    <h2 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
                      No posts yet
                    </h2>
                    <p className="mb-4 text-slate-600 dark:text-slate-400">
                      Follow users to see their posts in your feed
                    </p>
                    <Button onClick={() => navigate("/explore")} className="mx-auto">
                      Explore creators
                    </Button>
                  </>
                ) : (
                  <>
                    <LogIn className="mx-auto mb-4 h-12 w-12 text-slate-400" />
                    <h2 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
                      Sign in to see posts
                    </h2>
                    <p className="mb-4 text-slate-600 dark:text-slate-400">
                      Connect with your friends and see what they are sharing
                    </p>
                    <Button onClick={() => navigate("/signin")} className="mx-auto">
                      Sign In
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onUpdate={handleUpdatePost}
                  onDelete={handleRemovePost}
                />
              ))}
            </div>
          )}
        </section>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-500">
                  Discover
                </p>
                <h2 className="mt-1 text-base font-semibold text-slate-900 dark:text-white">
                  Suggested for you
                </h2>
              </div>
              <div className="rounded-full bg-pink-100 p-2 text-pink-600 dark:bg-pink-500/10 dark:text-pink-300">
                <Users className="h-4 w-4" />
              </div>
            </div>

            <CardContent className="p-4">
              {suggestionsLoading ? (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Loader className="h-4 w-4 animate-spin" />
                  Loading profiles...
                </div>
              ) : suggestedUsers.length === 0 ? (
                <div className="space-y-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    You are following everyone currently suggested.
                  </p>
                  <Button variant="outline" className="w-full" onClick={() => navigate("/explore")}>
                    Explore users
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {suggestedUsers.slice(0, 8).map((suggestedUser) => (
                      <div key={suggestedUser._id} className="min-w-[110px] flex-1 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center shadow-sm transition hover:border-pink-200 hover:bg-pink-50 dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-pink-500/40 dark:hover:bg-slate-900">
                        <button type="button" onClick={() => navigate(`/profile/${suggestedUser._id}`)} className="block w-full">
                          <img
                            src={suggestedUser.Photo || "/avatar.png"}
                            alt={suggestedUser.name}
                            className="mx-auto mb-2 h-12 w-12 rounded-full object-cover ring-2 ring-white dark:ring-slate-950"
                          />
                          <div className="space-y-1">
                            <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{suggestedUser.name}</p>
                            <p className="truncate text-[11px] text-slate-500">@{suggestedUser.userName}</p>
                          </div>
                        </button>
                        <Button
                          size="sm"
                          variant={suggestedUser.isFollowing ? "secondary" : "default"}
                          onClick={() => handleFollow(suggestedUser._id)}
                          disabled={followingId === suggestedUser._id || suggestedUser.isFollowing}
                          className="mt-3 w-full"
                        >
                          {suggestedUser.isFollowing ? "Following" : followingId === suggestedUser._id ? "..." : "Follow"}
                        </Button>
                      </div>
                    ))}
                  </div>

                  <Button variant="outline" className="w-full" onClick={() => navigate("/explore")}>
                    See more users
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-500">
                  Trending
                </p>
                <h2 className="mt-1 text-base font-semibold text-slate-900 dark:text-white">
                  Live topics
                </h2>
              </div>
              <div className="rounded-full bg-amber-100 p-2 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>

            <CardContent className="space-y-3 p-4">
              {trendingCards.map((item, index) => (
                <div key={item.label} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-400 text-xs font-bold text-white">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{item.label}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.value} posts today</p>
                    </div>
                  </div>
                  <Flame className="h-4 w-4 text-pink-500" />
                </div>
              ))}
              <Button variant="outline" className="w-full" onClick={() => navigate("/explore")}>
                <Search className="mr-2 h-4 w-4" />
                Explore trends
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
