import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Camera, Edit3, Mail, UserRound, Users } from "lucide-react";
import { toast } from "react-toastify";
import Avatar from "../components/Avatar";
import PostCard from "../components/PostCard";
import FollowersModal from "../components/FollowersModal";
import FollowingModal from "../components/FollowingModal";
import {
  getMyProfile,
  getUserProfile,
  updateProfile,
  followUser,
  unfollowUser,
  checkIsFollowing,
} from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const { userId } = useParams();
  const { user, updateUser } = useAuth();
  const isOwnProfile = !userId || userId === user?._id;

  // Profile state
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  // Edit mode state
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [form, setForm] = useState({
    name: "",
    userName: "",
    email: "",
    Photo: "",
  });

  // Modal states
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

  // Load profile
  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        let data;
        if (isOwnProfile) {
          data = await getMyProfile();
        } else {
          data = await getUserProfile(userId);
          const followStatus = await checkIsFollowing(userId);
          setIsFollowing(followStatus.isFollowing);
        }
        setProfile(data.user);
        setPosts(data.posts || []);

        if (isOwnProfile) {
          setForm({
            name: data.user.name,
            userName: data.user.userName,
            email: data.user.email,
            Photo: data.user.Photo,
          });
          setPhotoPreview(data.user.Photo || "");
        }
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [userId, isOwnProfile]);

  // Cleanup blob URLs
  useEffect(() => {
    return () => {
      if (photoPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const beginEditing = () => {
    setForm({
      name: profile?.name || "",
      userName: profile?.userName || "",
      email: profile?.email || "",
      Photo: profile?.Photo || "",
    });
    setPhotoFile(null);
    setPhotoPreview(profile?.Photo || "");
    setEditing(true);
  };

  const choosePhoto = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      return;
    }
    setPhotoFile(file);
    setPhotoPreview((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  const uploadPhoto = async () => {
    if (!photoFile) return form.Photo;
    const data = new FormData();
    data.append("file", photoFile);
    data.append("upload_preset", "instaclone");
    data.append("cloud_name", "sudhanshugaikwad");
    const response = await fetch(
      "https://api.cloudinary.com/v1_1/sudhanshugaikwad/image/upload",
      { method: "POST", body: data }
    );
    const result = await response.json();
    if (!response.ok || !result.secure_url) {
      throw new Error("Profile photo upload failed");
    }
    return result.secure_url;
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.userName.trim() || !form.email.trim()) {
      toast.error("Name, username, and email are required");
      return;
    }
    setSaving(true);
    try {
      const photoUrl = await uploadPhoto();
      const result = await updateProfile(
        form.name.trim(),
        form.userName.trim(),
        form.email.trim(),
        photoUrl
      );
      updateUser(result.user);
      setProfile(result.user);
      setPhotoFile(null);
      setPhotoPreview(result.user.Photo || "");
      setEditing(false);
      toast.success("Profile updated");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleFollow = async () => {
    try {
      await followUser(userId);
      setIsFollowing(true);
      toast.success("User followed");
      // Reload profile to get updated follower count
      const data = await getUserProfile(userId);
      setProfile(data.user);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleUnfollow = async () => {
    try {
      await unfollowUser(userId);
      setIsFollowing(false);
      toast.success("User unfollowed");
      // Reload profile to get updated follower count
      const data = await getUserProfile(userId);
      setProfile(data.user);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const updatePost = (updatedPost) => {
    setPosts((prev) =>
      prev.map((post) => (post._id === updatedPost._id ? updatedPost : post))
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-red-500">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Profile Header */}
      <section className="border-b border-stone-200 pb-8">
        {!editing ? (
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-10">
            <Avatar size="lg" name={profile?.name} src={profile?.Photo} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display text-2xl font-bold text-ink">
                  {profile?.name}
                </h1>
                {isOwnProfile ? (
                  <button
                    onClick={beginEditing}
                    className="inline-flex items-center gap-2 rounded-lg border border-stone-300 px-3 py-2 text-sm font-semibold text-gray-900 transition hover:border-coral hover:text-coral"
                  >
                    <Edit3 size={16} />
                    Edit profile
                  </button>
                ) : (
                  <button
                    onClick={isFollowing ? handleUnfollow : handleFollow}
                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                      isFollowing
                        ? "border border-stone-300 text-gray-900 hover:border-red-300 hover:text-red-600"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                  >
                    {isFollowing ? "Unfollow" : "Follow"}
                  </button>
                )}
              </div>
              <p className="mt-1 text-stone-500">@{profile?.userName}</p>
              {profile?.bio && <p className="mt-2 text-stone-600">{profile.bio}</p>}
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-stone-600">
                <span className="inline-flex items-center gap-2">
                  <Mail size={15} />
                  {profile?.email}
                </span>
                <button
                  onClick={() => setShowFollowers(true)}
                  className="inline-flex items-center gap-2 font-semibold text-ink hover:text-coral"
                >
                  <Users size={15} />
                  {profile?.followers?.length || 0} followers
                </button>
                <button
                  onClick={() => setShowFollowing(true)}
                  className="inline-flex items-center gap-2 font-semibold text-ink hover:text-coral"
                >
                  <Users size={15} />
                  {profile?.following?.length || 0} following
                </button>
                <span className="font-semibold text-ink">
                  {posts.length} posts
                </span>
              </div>
            </div>
          </div>
        ) : (
          <form
            onSubmit={saveProfile}
            className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7"
          >
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.18em] text-coral">
                  Account settings
                </p>
                <h1 className="mt-1 font-display text-2xl font-bold text-ink">
                  Edit profile
                </h1>
              </div>
              <div className="relative shrink-0">
                <Avatar
                  size="md"
                  name={form.name}
                  src={photoPreview || form.Photo}
                />
                <label
                  htmlFor="profile-photo"
                  className="absolute -bottom-1 -right-1 grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-coral text-white shadow-md transition hover:bg-[#df4b38]"
                  title="Change profile photo"
                >
                  <Camera size={15} />
                  <input
                    id="profile-photo"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={choosePhoto}
                  />
                </label>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold text-ink">
                Full name
                <input
                  className="field mt-2"
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                />
              </label>
              <label className="text-sm font-semibold text-ink">
                Username
                <input
                  className="field mt-2"
                  value={form.userName}
                  onChange={(event) =>
                    setForm({ ...form, userName: event.target.value })
                  }
                />
              </label>
              <label className="text-sm font-semibold text-ink sm:col-span-2">
                Email address
                <input
                  className="field mt-2"
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm({ ...form, email: event.target.value })
                  }
                />
              </label>
              <div className="flex items-center gap-3 rounded-xl bg-stone-50 p-3 text-sm text-stone-500 sm:col-span-2">
                <Camera size={18} className="shrink-0 text-coral" />
                <span className="min-w-0 truncate">
                  {photoFile
                    ? photoFile.name
                    : "Choose a profile photo using the camera button above."}
                </span>
              </div>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-xl border border-stone-300 px-5 py-3 text-sm font-semibold text-ink hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-coral px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#df4b38] disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        )}
      </section>

     
      {/* Posts Section */}
        <section className="mt-8">
          <h2 className="mb-6 font-display text-xl font-bold text-ink">Your Post</h2>
          {posts.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-stone-300 py-12 text-center">
              <UserRound size={48} className="mx-auto mb-3 text-stone-400" />
              <p className="text-stone-500">No posts yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} onUpdate={updatePost} />
              ))}
            </div>
          )}
        </section>

      {/* Followers Modal */}
      {showFollowers && (
        <FollowersModal
          userId={profile._id}
          followers={profile?.followers || []}
          onClose={() => setShowFollowers(false)}
        />
      )}

      {/* Following Modal */}
      {showFollowing && (
        <FollowingModal
          userId={profile._id}
          following={profile?.following || []}
          onClose={() => setShowFollowing(false)}
        />
      )}
    </div>
  );
}
