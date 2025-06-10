// Update your existing ChatHeader.jsx to support groups
import { useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useGroupStore } from "../store/useGroupStore";
import { 
  X, Phone, Video, MoreVertical, ArrowLeft, 
  Users, Crown, Settings, UserMinus, LogOut,
  Search
} from "lucide-react";
import GroupInfo from "./GroupInfo"; // ADD THIS IMPORT

const ChatHeader = () => {
  const [showGroupInfo, setShowGroupInfo] = useState(false); // ADD THIS STATE
  
  const { 
    selectedUser, selectedGroup, setSelectedUser, 
    setSelectedGroup, chatType, clearChat 
  } = useChatStore();
  
  const { onlineUsers, authUser } = useAuthStore();
  const { leaveGroup, deleteGroup } = useGroupStore();

  const handleBack = () => {
    clearChat();
  };

  const handleLeaveGroup = async () => {
    if (window.confirm('Are you sure you want to leave this group?')) {
      await leaveGroup(selectedGroup._id);
      clearChat();
    }
  };

  const handleDeleteGroup = async () => {
    if (window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      await deleteGroup(selectedGroup._id);
      clearChat();
    }
  };

  // Get current user's role in group
  const getCurrentUserRole = () => {
    if (!selectedGroup || !authUser) return null;
    const member = selectedGroup.members?.find(member => 
      member.user._id === authUser._id
    );
    return member?.role || null;
  };

  const userRole = getCurrentUserRole();
  const isAdmin = userRole === 'admin';
  // FIX THE CREATOR CHECK - was incorrect before
  const isCreator = selectedGroup?._id === authUser._id;

  if (chatType === 'group' && selectedGroup) {
    // Group Chat Header
    const onlineMembers = selectedGroup.members?.filter(member => 
      onlineUsers.includes(member.user._id)
    ).length || 0;

    return (
      <>
        <div className="bg-base-100 border-b border-base-300 px-4 py-3">
          <div className="flex items-center justify-between">
            
            {/* Left Section - Group Info */}
            <div className="flex items-center gap-3">
              {/* Back Button (Mobile) */}
              <button
                onClick={handleBack}
                className="lg:hidden btn btn-ghost btn-sm btn-circle"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              {/* Group Avatar - MAKE IT CLICKABLE */}
              <button
                onClick={() => setShowGroupInfo(true)}
                className="relative hover:opacity-80 transition-opacity"
              >
                <img
                  src={selectedGroup.groupPic || "avatar.png"}
                  alt={selectedGroup.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-base-300"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-base-100 border border-base-300 rounded-full flex items-center justify-center">
                  <Users className="w-2 h-2 text-base-content" />
                </div>
              </button>

              {/* Group Details - MAKE IT CLICKABLE */}
              <button
                onClick={() => setShowGroupInfo(true)}
                className="min-w-0 flex-1 text-left hover:opacity-80 transition-opacity"
              >
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-base-content text-base leading-tight truncate">
                    {selectedGroup.name}
                  </h3>
                  {isAdmin && (
                    <Crown className="w-4 h-4 text-warning" title="Admin" />
                  )}
                </div>
                <p className="text-sm text-base-content/70 leading-tight">
                  {selectedGroup.members?.length || 0} members
                  {onlineMembers > 0 && (
                    <span className="text-success"> • {onlineMembers} online</span>
                  )}
                </p>
              </button>
            </div>

            {/* Right Section - Action Buttons */}
            <div className="flex items-center gap-1">
              {/* Video Call Button */}
              <button className="btn btn-ghost btn-sm btn-circle" title="Video Call">
                <Video className="w-5 h-5" />
              </button>

              {/* Voice Call Button */}
              <button className="btn btn-ghost btn-sm btn-circle" title="Voice Call">
                <Phone className="w-5 h-5" />
              </button>

              {/* Group Menu */}
              <div className="dropdown dropdown-end">
                <button className="btn btn-ghost btn-sm btn-circle">
                  <MoreVertical className="w-5 h-5" />
                </button>
                <ul className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-56 border border-base-300">
                  <li>
                    <button 
                      onClick={() => setShowGroupInfo(true)}
                      className="flex items-center gap-2"
                    >
                      <Users className="w-4 h-4" />
                      Group Info
                    </button>
                  </li>
                  {isAdmin && (
                    <li>
                      <button 
                        onClick={() => setShowGroupInfo(true)}
                        className="flex items-center gap-2"
                      >
                        <Settings className="w-4 h-4" />
                        Group Settings
                      </button>
                    </li>
                  )}
                  <li>
                    <button className="flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      Search Messages
                    </button>
                  </li>
                  <div className="divider my-1"></div>
                  <li>
                    <button 
                      onClick={handleLeaveGroup}
                      className="flex items-center gap-2 text-warning hover:bg-warning hover:text-warning-content"
                    >
                      <LogOut className="w-4 h-4" />
                      Leave Group
                    </button>
                  </li>
                  {isCreator && (
                    <li>
                      <button 
                        onClick={handleDeleteGroup}
                        className="flex items-center gap-2 text-error hover:bg-error hover:text-error-content"
                      >
                        <UserMinus className="w-4 h-4" />
                        Delete Group
                      </button>
                    </li>
                  )}
                </ul>
              </div>

              {/* Close Chat (Desktop) */}
              <button
                onClick={handleBack}
                className="hidden lg:flex btn btn-ghost btn-sm btn-circle ml-2 hover:text-error"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
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
    // Direct Chat Header (existing code)
    const isOnline = onlineUsers.includes(selectedUser._id);

    return (
      <div className="bg-base-100 border-b border-base-300 px-4 py-3">
        <div className="flex items-center justify-between">
          
          {/* Left Section - User Info */}
          <div className="flex items-center gap-3">
            {/* Back Button (Mobile) */}
            <button
              onClick={handleBack}
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
              onClick={handleBack}
              className="hidden lg:flex btn btn-ghost btn-sm btn-circle ml-2 hover:text-error"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ChatHeader;