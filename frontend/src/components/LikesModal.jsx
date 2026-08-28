import { useEffect } from "react";
import { X, Heart } from "lucide-react";
import { Link } from "react-router-dom";

export default function LikesModal({ likes = [], onClose }) {
  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);
// console.log("likes data →", likes);
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md max-h-[85vh] sm:max-h-[70vh] bg-white rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col animate-in slide-in-from-bottom-4 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <Heart size={18} className="text-coral fill-coral" />
            <h3 className="font-semibold text-ink">
              Likes <span className="text-stone-500 font-normal">({likes.length})</span>
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500 transition"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Likes List */}
        <div className="overflow-y-auto flex-1 px-2 py-2">
          {likes.length === 0 ? (
            <div className="py-12 text-center text-stone-500 text-sm">
              No likes yet
            </div>
          ) : (
            <ul className="space-y-1">
              {likes.map((user) => (
                <li key={user._id}>
                  <Link
                    to={`/profile/${user._id}`}
                    onClick={onClose}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-stone-50 transition"
                  >
                    <img
                      src={user.Photo || "https://cdn-icons-png.flaticon.com/128/3177/3177440.png"}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover border border-stone-200"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-ink truncate">{user.name}</p>
                      {user.userName && (
                        <p className="text-sm text-stone-500 truncate">@{user.userName}</p>
                      )}
                    </div>
                  </Link>
                </li>
              ))}

            
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}