// src/components/MobileChatHeader.jsx - Updated with clickable profiles
import { ArrowLeft, Phone, Video, MoreVertical, Users } from "lucide-react";
import { useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import GroupInfo from "./GroupInfo";
import FriendProfile from "./FriendProfile";

const MobileChatHeader = ({ onBack }) => {
  const { selectedUser, selectedGroup, chatType } = useChatStore();
  const { onlineUsers } = useAuthStore();
  
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showFriendProfile, setShowFriendProfile] = useState(false);

  if (chatType === 'group' && selectedGroup) {
    const onlineMembers = selectedGroup.members?.filter(member => 
      onlineUsers.includes(member.user._id)
    ).length || 0;

    return (
      <>
        <div className="bg-base-100 border-b border-base-300 px-4 py-3 flex items-center gap-3 h-16">
          <button
            onClick={onBack}
            className="btn btn-ghost btn-sm btn-circle touch-manipulation"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Clickable Group Avatar */}
          <button
            onClick={() => setShowGroupInfo(true)}
            className="relative hover:opacity-80 transition-opacity touch-manipulation"
          >
            <img
              src={selectedGroup.groupPic || "/avatar.png"}
              alt={selectedGroup.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-base-300"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-base-100 border border-base-300 rounded-full flex items-center justify-center">
              <Users className="w-2 h-2 text-base-content" />
            </div>
          </button>

          {/* Clickable Group Info */}
          <button
            onClick={() => setShowGroupInfo(true)}
            className="flex-1 min-w-0 text-left hover:opacity-80 transition-opacity touch-manipulation"
          >
            <h3 className="font-semibold text-base-content text-sm leading-tight truncate">
              {selectedGroup.name}
            </h3>
            <p className="text-xs text-base-content/70 leading-tight">
              {selectedGroup.members?.length || 0} members
              {onlineMembers > 0 && (
                <span className="text-success"> • {onlineMembers} online</span>
              )}
            </p>
          </button>

          <div className="flex items-center gap-1">
            <button className="btn btn-ghost btn-sm btn-circle touch-manipulation">
              <Phone className="w-4 h-4" />
            </button>
            <button className="btn btn-ghost btn-sm btn-circle touch-manipulation">
              <Video className="w-4 h-4" />
            </button>
            <button className="btn btn-ghost btn-sm btn-circle touch-manipulation">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Group Info Modal */}
        <GroupInfo
          group={selectedGroup}
          isOpen={showGroupInfo}
          onClose={() => setShowGroupInfo(false)}
        />
      </>
    );
  }

  if (chatType === 'direct' && selectedUser) {
    const isOnline = onlineUsers.includes(selectedUser._id);

    return (
      <>
        <div className="bg-base-100 border-b border-base-300 px-4 py-3 flex items-center gap-3 h-16">
          <button
            onClick={onBack}
            className="btn btn-ghost btn-sm btn-circle touch-manipulation"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Clickable User Avatar */}
          <button
            onClick={() => setShowFriendProfile(true)}
            className="relative hover:opacity-80 transition-opacity touch-manipulation"
          >
            <img
              src={selectedUser.profilePic || "/avatar.png"}
              alt={selectedUser.fullName}
              className="w-10 h-10 rounded-full object-cover border-2 border-base-300"
            />
            {isOnline && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-success border-2 border-base-100 rounded-full"></div>
            )}
          </button>

          {/* Clickable User Info */}
          <button
            onClick={() => setShowFriendProfile(true)}
            className="flex-1 min-w-0 text-left hover:opacity-80 transition-opacity touch-manipulation"
          >
            <h3 className="font-semibold text-base-content text-sm leading-tight truncate">
              {selectedUser.fullName}
            </h3>
            <p className="text-xs text-base-content/70 leading-tight">
              {isOnline ? (
                <span className="text-success font-medium">● Online</span>
              ) : (
                <span>Last seen recently</span>
              )}
            </p>
          </button>

          <div className="flex items-center gap-1">
            <button className="btn btn-ghost btn-sm btn-circle touch-manipulation">
              <Phone className="w-4 h-4" />
            </button>
            <button className="btn btn-ghost btn-sm btn-circle touch-manipulation">
              <Video className="w-4 h-4" />
            </button>
            <button className="btn btn-ghost btn-sm btn-circle touch-manipulation">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Friend Profile Modal */}
        <FriendProfile
          friend={selectedUser}
          isOpen={showFriendProfile}
          onClose={() => setShowFriendProfile(false)}
        />
      </>
    );
  }

  return null;
};

export default MobileChatHeader;