import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Avatar from "./Avatar";

export default function FollowingModal({ userId, following, onClose }) {
  const navigate = useNavigate();

  const handleUserClick = (followingUserId) => {
    onClose();
    navigate(`/profile/${followingUserId}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-stone-200 p-4">
          <h2 className="font-display text-lg font-bold text-ink">Following</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-stone-500 hover:bg-stone-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {following && following.length > 0 ? (
            <ul className="divide-y divide-stone-200">
              {following.map((user) => (
                <li
                  key={user._id}
                  className="flex items-center justify-between p-4 hover:bg-stone-50 cursor-pointer"
                  onClick={() => handleUserClick(user._id)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar size="sm" name={user.name} src={user.Photo} />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-ink">
                        {user.name}
                      </p>
                      <p className="truncate text-sm text-stone-500">
                        @{user.userName}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-8 text-center text-stone-500">
              <p>Not following anyone yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
