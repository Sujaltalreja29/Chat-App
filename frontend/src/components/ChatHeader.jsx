import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { X, Phone, Video, MoreVertical, ArrowLeft } from "lucide-react";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  
  const isOnline = onlineUsers.includes(selectedUser._id);

  return (
    <div className="bg-base-100 border-b border-base-300 px-4 py-3">
      <div className="flex items-center justify-between">
        
        {/* Left Section - User Info */}
        <div className="flex items-center gap-3">
          {/* Back Button (Mobile) */}
          <button
            onClick={() => setSelectedUser(null)}
            className="lg:hidden btn btn-ghost btn-sm btn-circle"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* User Avatar */}
          <div className="relative">
            <img
              src={selectedUser.profilePic || "/avatar.png"}
              alt={selectedUser.fullName}
              className="w-10 h-10 rounded-full object-cover border-2 border-base-300"
            />
            {/* Online Status Indicator */}
            {isOnline && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-success border-2 border-base-100 rounded-full"></div>
            )}
          </div>

          {/* User Details */}
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-base-content text-base leading-tight truncate">
              {selectedUser.fullName}
            </h3>
            <p className="text-sm text-base-content/70 leading-tight">
              {isOnline ? (
                <span className="text-success font-medium">● Online</span>
              ) : (
                <span>Last seen recently</span>
              )}
            </p>
          </div>
        </div>

        {/* Right Section - Action Buttons */}
        <div className="flex items-center gap-1">
          {/* Video Call Button */}
          <button className="btn btn-ghost btn-sm btn-circle">
            <Video className="w-5 h-5" />
          </button>

          {/* Voice Call Button */}
          <button className="btn btn-ghost btn-sm btn-circle">
            <Phone className="w-5 h-5" />
          </button>

          {/* More Options */}
          <button className="btn btn-ghost btn-sm btn-circle">
            <MoreVertical className="w-5 h-5" />
          </button>

          {/* Close Chat (Desktop) */}
          <button
            onClick={() => setSelectedUser(null)}
            className="hidden lg:flex btn btn-ghost btn-sm btn-circle ml-2 hover:text-error"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;