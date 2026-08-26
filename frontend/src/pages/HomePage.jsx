import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PostCard from "../components/PostCard";
import { getAllPosts } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Users, LogIn } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleUpdatePost = (updatedPost) => {
    setPosts((items) =>
      items.map((item) => (item._id === updatedPost._id ? updatedPost : item))
    );
  };

  const handleRemovePost = (deletedPostId) => {
    setPosts((items) => items.filter((post) => post._id !== deletedPostId));
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-0 py-6 sm:px-6 lg:grid-cols-[minmax(0,620px)_280px]">
      <section>
        <div className="mb-5 px-4 sm:px-0">
          <p className="text-sm font-semibold uppercase tracking-[.2em] text-coral">
            Your feed
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold text-ink">
            Good moments, shared.
          </h1>
        </div>

        {loading ? (
          <div className="mx-4 rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center text-stone-500 sm:mx-0">
            <p>Loading posts...</p>
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-5">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onUpdate={handleUpdatePost}
                onDelete={handleRemovePost}
              />
            ))}
          </div>
        ) : (
          <div className="mx-4 rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center text-stone-500 sm:mx-0">
            <Users size={48} className="mx-auto mb-3 text-stone-400" />
            <p>No posts yet. Follow users or create a post!</p>
          </div>
        )}
      </section>

      {/* Sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 space-y-4">
          {user ? (
            <div className="rounded-2xl border border-stone-200 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[.18em] text-stone-400">
                Signed in as
              </p>
              <p className="mt-2 font-semibold text-ink">{user?.name}</p>
              <p className="text-sm text-stone-500">@{user?.userName}</p>

              <button
                onClick={() => navigate("/create-post")}
                className="mt-4 w-full rounded-lg bg-coral px-4 py-2 text-sm font-semibold text-white transition hover:bg-coral/90"
              >
                Create Post
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-stone-200 bg-white p-5">
              <LogIn size={32} className="mx-auto mb-3 text-coral" />
              <p className="text-center font-semibold text-ink">Sign in to create posts</p>
              <p className="mt-2 text-center text-sm text-stone-500">
                Join our community to share moments
              </p>
              <button
                onClick={() => navigate("/signin")}
                className="mt-4 w-full rounded-lg bg-coral px-4 py-2 text-sm font-semibold text-white transition hover:bg-coral/90"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="mt-2 w-full rounded-lg border border-coral px-4 py-2 text-sm font-semibold text-coral transition hover:bg-coral/10"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>

      </aside>
    </div>
  );
}
