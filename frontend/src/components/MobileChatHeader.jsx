// src/components/MobileChatHeader.jsx - COMPLETE CODE with remove friend functionality
import { ArrowLeft, Phone, Video, MoreVertical, Users, Search, Crown, Settings, UserMinus, LogOut, User, Info } from "lucide-react";
import { useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useGroupStore } from "../store/useGroupStore";
import { useFriendStore } from "../store/useFriendStore"; // ADD THIS
import { useSearchStore } from "../store/useSearchStore";
import GroupInfo from "./GroupInfo";
import FriendProfile from "./FriendProfile";

const MobileChatHeader = ({ onBack }) => {
  const { selectedUser, selectedGroup, chatType, clearChat } = useChatStore();
  const { onlineUsers, authUser } = useAuthStore();
  const { leaveGroup, deleteGroup } = useGroupStore();
  const { removeFriend } = useFriendStore(); // ADD THIS
  
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showFriendProfile, setShowFriendProfile] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false); // ADD THIS STATE

  const { toggleConversationSearch } = useSearchStore();

  // ADD THIS FUNCTION
  const handleRemoveFriend = async () => {
    try {
      await removeFriend(selectedUser._id);
      setShowRemoveConfirm(false);
      setShowDropdown(false);
      clearChat(); // Close the chat after removing friend
    } catch (error) {
      console.error('Failed to remove friend:', error);
    }
  };

  const handleConversationSearch = () => {
    const chatId = chatType === 'group' ? selectedGroup?._id : selectedUser?._id;
    toggleConversationSearch(chatId, chatType);
    setShowDropdown(false);
  };

  const handleDropdownToggle = (e) => {
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  const handleBackdropClick = () => {
    setShowDropdown(false);
  };

  const handleLeaveGroup = async () => {
    if (window.confirm('Are you sure you want to leave this group?')) {
      await leaveGroup(selectedGroup._id);
      clearChat();
    }
    setShowDropdown(false);
  };

  const handleDeleteGroup = async () => {
    if (window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      await deleteGroup(selectedGroup._id);
      clearChat();
    }
    setShowDropdown(false);
  };

  const getCurrentUserRole = () => {
    if (!selectedGroup || !authUser) return null;
    const member = selectedGroup.members?.find(member => 
      member.user._id === authUser._id
    );
    return member?.role || null;
  };

  if (chatType === 'group' && selectedGroup) {
    const onlineMembers = selectedGroup.members?.filter(member => 
      onlineUsers.includes(member.user._id)
    ).length || 0;

    const userRole = getCurrentUserRole();
    const isAdmin = userRole === 'admin';
    const isCreator = selectedGroup?.createdBy === authUser._id;

    return (
      <>
        {/* Backdrop for dropdown */}
        {showDropdown && (
          <div 
            className="fixed inset-0 z-40 bg-black/20" 
            onClick={handleBackdropClick}
          />
        )}

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
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-base-content text-sm leading-tight truncate">
                {selectedGroup.name}
              </h3>
              {isAdmin && (
                <Crown className="w-3 h-3 text-warning flex-shrink-0" title="Admin" />
              )}
            </div>
            <p className="text-xs text-base-content/70 leading-tight">
              {selectedGroup.members?.length || 0} members
              {onlineMembers > 0 && (
                <span className="text-success"> • {onlineMembers} online</span>
              )}
            </p>
          </button>

          {/* Action buttons with working dropdown */}
          <div className="flex items-center gap-1 relative">
            <button 
              onClick={handleConversationSearch}
              className="btn btn-ghost btn-sm btn-circle touch-manipulation"
              title="Search in chat"
            >
              <Search className="w-4 h-4" />
            </button>
            
            {/* Dropdown menu */}
            <div className="relative">
              <button 
                onClick={handleDropdownToggle}
                className="btn btn-ghost btn-sm btn-circle touch-manipulation"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 top-full mt-2 z-50 bg-base-100 border border-base-300 rounded-lg shadow-xl w-56 py-2">
                  <button 
                    onClick={() => {
                      setShowGroupInfo(true);
                      setShowDropdown(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-base-200 flex items-center gap-3 transition-colors"
                  >
                    <Users className="w-4 h-4" />
                    <span>Group Info</span>
                  </button>
                  
                  {isAdmin && (
                    <button 
                      onClick={() => {
                        setShowGroupInfo(true);
                        setShowDropdown(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-base-200 flex items-center gap-3 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Group Settings</span>
                    </button>
                  )}
                  
                  <button 
                    onClick={handleConversationSearch}
                    className="w-full px-4 py-3 text-left hover:bg-base-200 flex items-center gap-3 transition-colors"
                  >
                    <Search className="w-4 h-4" />
                    <span>Search Messages</span>
                  </button>
                  
                  <div className="border-t border-base-300 my-2"></div>
                  
                  <button 
                    onClick={handleLeaveGroup}
                    className="w-full px-4 py-3 text-left hover:bg-warning/10 flex items-center gap-3 text-warning transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Leave Group</span>
                  </button>
                  
                  {isCreator && (
                    <button 
                      onClick={handleDeleteGroup}
                      className="w-full px-4 py-3 text-left hover:bg-error/10 flex items-center gap-3 text-error transition-colors"
                    >
                      <UserMinus className="w-4 h-4" />
                      <span>Delete Group</span>
                    </button>
                  )}
                </div>
              )}
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
    const isOnline = onlineUsers.includes(selectedUser._id);

    return (
      <>
        {/* Backdrop for dropdown */}
        {showDropdown && (
          <div 
            className="fixed inset-0 z-40 bg-black/20" 
            onClick={handleBackdropClick}
          />
        )}

        {/* 🔥 Remove Friend Confirmation Modal */}
        {showRemoveConfirm && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
            <div className="bg-base-100 rounded-2xl shadow-xl w-full max-w-md p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-error/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserMinus className="w-8 h-8 text-error" />
                </div>
                
                <h3 className="text-lg font-bold text-base-content mb-2">
                  Remove Friend
                </h3>
                
                <p className="text-base-content/70 mb-6">
                  Are you sure you want to remove <span className="font-semibold">{selectedUser.fullName}</span> from your friends list? 
                  This action cannot be undone and will close this chat.
                </p>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowRemoveConfirm(false)}
                    className="btn btn-ghost flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRemoveFriend}
                    className="btn btn-error flex-1"
                  >
                    Remove Friend
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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

          {/* Action buttons with working dropdown */}
          <div className="flex items-center gap-1 relative">
            <button 
              onClick={handleConversationSearch}
              className="btn btn-ghost btn-sm btn-circle touch-manipulation"
              title="Search in chat"
            >
              <Search className="w-4 h-4" />
            </button>
            
            {/* Dropdown menu */}
            <div className="relative">
              <button 
                onClick={handleDropdownToggle}
                className="btn btn-ghost btn-sm btn-circle touch-manipulation"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {/* 🔥 UPDATED: Dropdown Menu with Working Remove Friend */}
              {showDropdown && (
                <div className="absolute right-0 top-full mt-2 z-50 bg-base-100 border border-base-300 rounded-lg shadow-xl w-56 py-2">
                  <button 
                    onClick={() => {
                      setShowFriendProfile(true);
                      setShowDropdown(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-base-200 flex items-center gap-3 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>Friend Profile</span>
                  </button>
                  
                  <button 
                    onClick={handleConversationSearch}
                    className="w-full px-4 py-3 text-left hover:bg-base-200 flex items-center gap-3 transition-colors"
                  >
                    <Search className="w-4 h-4" />
                    <span>Search Messages</span>
                  </button>
                  
                  <div className="border-t border-base-300 my-2"></div>
                  
                  {/* 🔥 NEW: Working Remove Friend Button */}
                  <button 
                                        onClick={() => {
                      setShowRemoveConfirm(true);
                      setShowDropdown(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-warning/10 flex items-center gap-3 text-warning transition-colors"
                  >
                    <UserMinus className="w-4 h-4" />
                    <span>Remove Friend</span>
                  </button>
                </div>
              )}
            </div>
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