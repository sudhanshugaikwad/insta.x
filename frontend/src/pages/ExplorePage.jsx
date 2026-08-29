import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Flame, Grid, Heart, List, Loader, MessageCircle, Search, Sparkles } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { useAuth } from "../context/AuthContext";
import { followUser, getAllPosts, getAllUsers, getTrendingUsers, searchUsers } from "../lib/api";

export default function ExplorePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [followingId, setFollowingId] = useState("");

  const trendingTopics = useMemo(
    () => [
      { label: "Design systems", posts: "24K" },
      { label: "AI creators", posts: "18K" },
      { label: "Remote work", posts: "12K" },
      { label: "Travel stories", posts: "9K" },
    ],
    []
  );

  useEffect(() => {
    let active = true;

    const loadExplore = async () => {
      try {
        const [usersData, postsData, trendingData] = await Promise.all([
          getAllUsers(),
          getAllPosts(),
          getTrendingUsers(),
        ]);

        if (!active) return;

        const allUsers = (usersData.users || []).filter((item) => item._id !== user?._id);
        setUsers(allUsers);
        setTrendingPosts((postsData || []).sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0)).slice(0, 6));

        if (trendingData.users?.length) {
          setUsers((current) => {
            const existingIds = new Set(current.map((person) => person._id));
            const merged = [...current];
            trendingData.users.forEach((person) => {
              if (!existingIds.has(person._id)) {
                merged.push(person);
              }
            });
            return merged;
          });
        }
      } catch (requestError) {
        if (active) setError(requestError.message || "Unable to load Explore");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadExplore();
    return () => { active = false; };
  }, [user]);

  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      getAllUsers()
        .then((data) => {
          setUsers((data.users || []).filter((item) => item._id !== user?._id));
          setError("");
        })
        .catch((requestError) => setError(requestError.message || "Unable to search users"));
      return undefined;
    }

    const timer = setTimeout(async () => {
      try {
        const data = await searchUsers(query);
        setUsers((data.users || []).filter((item) => item._id !== user?._id));
        setError("");
      } catch (requestError) {
        setError(requestError.message || "Unable to search users");
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, user]);

  const handleFollow = async (userId) => {
    if (!user) {
      navigate("/signin");
      return;
    }

    setFollowingId(userId);
    try {
      await followUser(userId);
      setUsers((items) => items.map((item) => (item._id === userId ? { ...item, isFollowing: true } : item)));
      toast.success("User followed");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setFollowingId("");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3 pt-16 text-slate-600 dark:text-slate-400">
        <Loader className="h-5 w-5 animate-spin text-pink-500" />
        <span>Loading Explore...</span>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen pt-16">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pink-500">Discover</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
              Explore
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Discover new people and trending content
            </p>
          </div>
          <div className="rounded-full bg-pink-50 px-3 py-1.5 text-xs font-medium text-pink-700 dark:bg-pink-500/10 dark:text-pink-300">
            {users.length} people to meet
          </div>
        </div>

        {error && <p className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-500/10 dark:text-red-200">{error}</p>}

        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="mb-6 flex gap-2 sm:mb-8">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className="flex items-center gap-2"
          >
            <Grid className="h-4 w-4" />
            <span className="hidden sm:inline">Grid</span>
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="flex items-center gap-2"
          >
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">List</span>
          </Button>
        </div>

        {viewMode === "grid" ? (
          <div className="space-y-8">
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900 sm:text-xl dark:text-white">
                  People to follow
                </h2>
                <span className="text-sm text-slate-500 dark:text-slate-400">{users.length} results</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {users.map((suggestedUser) => (
                  <Card key={suggestedUser._id} className="overflow-hidden border-slate-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950">
                    <CardContent className="p-5 text-center">
                      <button type="button" onClick={() => navigate(`/profile/${suggestedUser._id}`)} className="block">
                        <img
                          src={suggestedUser.Photo || "/avatar.png"}
                          alt={suggestedUser.name}
                          className="mx-auto mb-4 h-16 w-16 rounded-full object-cover ring-4 ring-pink-100"
                        />
                      </button>
                      <h3 className="text-base font-semibold text-slate-900 dark:text-black">
                        {suggestedUser.name}
                      </h3>
                      <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">@{suggestedUser.userName}</p>
                      <div className="mb-4 flex items-center justify-center gap-4 text-xs text-slate-600 dark:text-slate-400">
                        <span>{(suggestedUser.followers?.length || 0).toLocaleString()} followers</span>
                        <span>{suggestedUser.posts || 0} posts</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => navigate(`/profile/${suggestedUser._id}`)}
                          className="flex-1"
                        >
                          View profile
                        </Button>
                        <Button
                          onClick={() => handleFollow(suggestedUser._id)}
                          disabled={followingId === suggestedUser._id || suggestedUser.isFollowing}
                          className="flex-1"
                        >
                          {suggestedUser.isFollowing ? "Following" : followingId === suggestedUser._id ? "..." : "Follow"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-pink-500" />
                  <h2 className="text-lg font-semibold text-slate-900 sm:text-xl dark:text-white">
                    Trending
                  </h2>
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400">Popular right now</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
                  <CardContent className="p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-pink-100 p-2 text-pink-600 dark:bg-pink-500/10 dark:text-pink-300">
                          <Flame className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Trending topics</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {trendingTopics.map((topic, index) => (
                        <div key={topic.label} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-900">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-semibold text-pink-500">#{index + 1}</span>
                            <span className="text-sm text-slate-700 dark:text-slate-200">{topic.label}</span>
                          </div>
                          <span className="text-xs text-slate-500 dark:text-slate-400">{topic.posts}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {trendingPosts.map((post) => (
                  <Card key={post._id} className="overflow-hidden border-slate-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950">
                    <div className="relative pb-[70%]">
                      <img
                        src={post.photos?.[0] || "https://placehold.co/700x500/png"}
                        alt={post.body || "Trending post"}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    </div>
                    <CardContent className="p-3 sm:p-4">
                      <p className="mb-3 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">{post.body}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          {(post.likes?.length || 0).toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          {(post.comments?.length || 0).toLocaleString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <h2 className="mb-4 text-lg font-semibold text-slate-900 sm:text-xl dark:text-white">
              Users
            </h2>
            {users.map((suggestedUser) => (
              <Card key={suggestedUser._id} className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between gap-3 sm:gap-4">
                    <div
                      className="flex min-w-0 flex-1 cursor-pointer items-center gap-3"
                      onClick={() => navigate(`/profile/${suggestedUser._id}`)}
                    >
                      <img
                        src={suggestedUser.Photo || "/avatar.png"}
                        alt={suggestedUser.name}
                        className="h-11 w-11 rounded-full object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-white sm:text-base">
                          {suggestedUser.name}
                        </h3>
                        <p className="truncate text-xs text-slate-600 dark:text-slate-400">@{suggestedUser.userName}</p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                          {(suggestedUser.followers?.length || 0).toLocaleString()} followers • {suggestedUser.posts || 0} posts
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={suggestedUser.isFollowing ? "secondary" : "default"}
                      onClick={() => handleFollow(suggestedUser._id)}
                      disabled={followingId === suggestedUser._id || suggestedUser.isFollowing}
                    >
                      {suggestedUser.isFollowing ? "Following" : followingId === suggestedUser._id ? "..." : "Follow"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {users.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              No users found matching "{searchQuery || "your search"}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
