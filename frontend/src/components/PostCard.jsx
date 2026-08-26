import { Heart, MessageCircle, Send, X, ChevronLeft, ChevronRight, MoreVertical, Trash2, Edit2 } from "lucide-react";
import Avatar from "./Avatar";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getPostComments, commentPost, likePost, unlikePost, deletePost, editPost } from "../lib/api";
import { toast } from "react-toastify";
import LikesModal from "./LikesModal"

export default function PostCard({ post, onUpdate, onDelete }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editBody, setEditBody] = useState(post.body || "");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showLikes, setShowLikes] = useState(false);

  const photos = post.photos || [];
  const isOwnPost = user && String(post.postedBy?._id) === String(user._id);
  const liked = (post.likes || []).some(
    (id) => String(id) === String(user?._id)
  );


  const viewComments = async () => {
    setCommentsOpen(true);
    setCommentsLoading(true);
    try {
      const result = await getPostComments(post._id);
      setComments(result.comments || []);
    } catch (error) {
      toast.error(error.message);
      setComments(post.comments || []);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast.error("Please sign in to like posts");
      navigate("/signin");
      return;
    }
    try {
      const updatedPost = liked
        ? await unlikePost(post._id)
        : await likePost(post._id);
      onUpdate?.(updatedPost);
    } catch (error) {
      toast.error(error.message);
    }
  };



  const addComment = async (postId, text) => {
    if (!user) {
      toast.error("Please sign in to comment");
      navigate("/signin");
      return;
    }
    try {
      const updatedPost = await commentPost(postId, text);
      if (updatedPost?.comments) setComments(updatedPost.comments);
      onUpdate?.(updatedPost);
      return updatedPost;
    } catch (error) {
      toast.error(error.message);
      return null;
    }
  };

  const handleEditPost = async () => {
    if (!editBody.trim()) {
      toast.error("Caption cannot be empty");
      return;
    }
    setSavingEdit(true);
    try {
      const updatedPost = await editPost(post._id, editBody.trim(), photos);
      onUpdate?.(updatedPost.post);
      setEditMode(false);
      toast.success("Post updated successfully");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }
    setDeleting(true);
    try {
      await deletePost(post._id);
      onDelete?.(post._id);
      toast.success("Post deleted successfully");
      setShowMenu(false);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setDeleting(false);
    }
  };

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) =>
      prev === photos.length - 1 ? 0 : prev + 1
    );
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) =>
      prev === 0 ? photos.length - 1 : prev - 1
    );
  };

  const handleProfileClick = () => {
    navigate(`/profile/${post.postedBy?._id}`);
  };

  return (
    <article className="overflow-hidden border-y border-stone-200 bg-white sm:rounded-2xl sm:border sm:shadow-sm">
      {/* Post Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div
          className="flex items-center gap-3 cursor-pointer hover:bg-stone-50 rounded flex-1"
          onClick={handleProfileClick}
        >
          <Avatar
            name={post.postedBy?.name}
            src={post.postedBy?.Photo}
            size="sm"
          />
          <div>
            <p className="text-sm font-semibold text-ink">
              {post.postedBy?.name || "Unknown user"}
            </p>
            <p className="text-xs text-stone-400">@{post.postedBy?.userName}</p>
          </div>
        </div>
        
        {/* Menu Button */}
        {isOwnPost && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-stone-100 rounded-full transition"
            >
              <MoreVertical size={18} className="text-stone-500" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-1 bg-white border border-stone-200 rounded-lg shadow-lg z-10 w-40">
                <button
                  onClick={() => setEditMode(true)}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-stone-50 flex items-center gap-2 transition"
                  disabled={savingEdit}
                >
                  <Edit2 size={16} />
                  Edit Caption
                </button>
                <button
                  onClick={handleDeletePost}
                  className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2 transition"
                  disabled={deleting}
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Mode */}
      {editMode && (
        <div className="border-t border-stone-200 bg-stone-50 p-4">
          <textarea
            value={editBody}
            onChange={(e) => setEditBody(e.target.value)}
            placeholder="Edit your caption..."
            className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-coral resize-none"
            rows="3"
            disabled={savingEdit}
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleEditPost}
              disabled={savingEdit}
              className="flex-1 bg-coral text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-coral/90 transition disabled:opacity-50"
            >
              {savingEdit ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => {
                setEditMode(false);
                setEditBody(post.body);
              }}
              disabled={savingEdit}
              className="flex-1 border border-stone-300 text-ink px-4 py-2 rounded-lg text-sm font-semibold hover:bg-stone-50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Caption */}
      {!editMode && (
        <div className="px-4 py-3 border-t border-stone-200">
          <p className="text-sm text-ink">
            <span className="font-semibold">{post.postedBy?.name}</span>{" "}
            {post.body}
          </p>
        </div>
      )}

      {/* Photos Section */}
      <div className="relative bg-stone-900">
        {photos.length > 0 ? (
          <>
            <img
              src={photos[currentPhotoIndex]}
              alt={`Post photo ${currentPhotoIndex + 1}`}
              className="aspect-square h-auto w-full object-cover rounded-xl"
            />

            {/* Navigation */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={prevPhoto}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={nextPhoto}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition"
                >
                  <ChevronRight size={20} />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs text-white font-semibold">
                  {currentPhotoIndex + 1} / {photos.length}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="aspect-square w-full bg-stone-800" />
        )}
      </div>

      {/* Post Content */}
     {/* Post Content */}
      <div className="p-4">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            aria-label={liked ? "Unlike post" : "Like post"}
            className={`transition ${liked ? "text-coral" : "text-ink hover:text-stone-600"}`}
          >
            <Heart size={23} fill={liked ? "currentColor" : "none"} />
          </button>
          <button
            aria-label="View comments"
            onClick={viewComments}
            className="text-ink hover:text-stone-600 transition"
          >
            <MessageCircle size={23} />
          </button>
          <button aria-label="Share" className="text-ink hover:text-stone-600 transition">
            <Send size={22} />
          </button>
        </div>

        {/* Likes Count - Clickable */}
        <button
          onClick={() => setShowLikes(true)}
          className="mt-3 text-sm font-semibold hover:underline text-left"
          disabled={(post.likes || []).length === 0}
        >
          {(post.likes || []).length} {(post.likes || []).length === 1 ? "like" : "likes"}
        </button>

        {/* Caption */}
        <p className="mt-1 text-sm">
          <span
            className="mr-2 font-semibold cursor-pointer hover:text-stone-600"
            onClick={handleProfileClick}
          >
            {post.postedBy?.userName || post.postedBy?.name}
          </span>
          {post.body}
        </p>

        {/* Comments Preview */}
        {(post.comments || []).length > 0 && (
          <button
            onClick={viewComments}
            className="mt-3 text-sm text-stone-600 hover:text-ink transition"
          >
            View all {post.comments.length} comments
          </button>
        )}
        <div className="mt-3 space-y-1 text-sm text-stone-600">
          {(post.comments || []).slice(-2).map((comment) => (
            <p key={comment._id || comment.comment}>
              <b>{comment.postedBy?.name || "User"}</b> {comment.comment}
            </p>
          ))}
        </div>

        {/* Add Comment Form */}
        <form
          className="mt-4 flex items-center gap-2 border-t border-stone-100 pt-3"
          onSubmit={(event) => {
            event.preventDefault();
            const text = event.currentTarget.elements.comment.value.trim();
            if (text) {
              addComment(post._id, text);
              event.currentTarget.reset();
            }
          }}
        >
          <input
            name="comment"
            placeholder="Add a comment..."
            className="min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
          <button className="text-sm font-semibold text-coral hover:text-coral/80 transition">
            Post
          </button>
        </form>

        {/* Likes Modal */}
      
      {showLikes && (
        <LikesModal
          likes={post.likes || []}
          onClose={() => setShowLikes(false)}
        />
      )}
      </div>
      {/* Comments Modal */}
      {commentsOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Post comments"
          onClick={() => setCommentsOpen(false)}
        >
          <div
            className="flex max-h-[min(680px,90vh)] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
              <div>
                <h2 className="font-display text-lg font-bold text-ink">
                  Comments
                </h2>
                <p className="text-xs text-stone-500">
                  {comments.length} comments
                </p>
              </div>
              <button
                onClick={() => setCommentsOpen(false)}
                aria-label="Close comments"
                className="rounded-full p-2 text-stone-500 hover:bg-stone-100 transition"
              >
                <X size={20} />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              {commentsLoading ? (
                <p className="py-8 text-center text-sm text-stone-500">
                  Loading comments...
                </p>
              ) : comments.length ? (
                <div className="space-y-5">
                  {comments.map((comment) => (
                    <div
                      key={
                        comment._id ||
                        `${comment.comment}-${comment.postedBy?._id}`
                      }
                      className="flex gap-3"
                    >
                      <Avatar
                        size="sm"
                        name={comment.postedBy?.name || "User"}
                        src={comment.postedBy?.Photo}
                      />
                      <p className="min-w-0 text-sm">
                        <span className="font-semibold text-ink">
                          {comment.postedBy?.userName ||
                            comment.postedBy?.name ||
                            "user"}
                        </span>
                        <span className="ml-2 break-words text-stone-600">
                          {comment.comment}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-stone-500">
                  No comments yet.
                </p>
              )}
            </div>
            <form
              className="flex gap-2 border-t border-stone-200 p-4"
              onSubmit={(event) => {
                event.preventDefault();
                const text =
                  event.currentTarget.elements.popupComment.value.trim();
                if (text) {
                  addComment(post._id, text);
                  event.currentTarget.reset();
                }
              }}
            >
              <input
                name="popupComment"
                className="min-w-0 flex-1 rounded-xl bg-stone-100 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-coral/30"
                placeholder="Add a comment..."
              />
              <button className="rounded-xl bg-coral px-4 py-3 text-sm font-semibold text-white hover:bg-coral/90 transition">
                Post
              </button>
            </form>
          </div>
        </div>
      )}
    </article>
  );
}
