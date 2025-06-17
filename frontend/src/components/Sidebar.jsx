// src/components/Sidebar.jsx - Fix the mobile display logic
import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useFriendStore } from "../store/useFriendStore";
import { useGroupStore } from "../store/useGroupStore";
import { useResponsive } from "../hooks/useResponsive";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import CreateGroup from "./CreateGroup";
import DefaultGroupIcon from "./DefaultGroupIcon";
import { formatLastMessage, formatMessageTime } from '../utils/messageFormatters';
import { 
  Users, Search, Filter, MessageCircle, UserPlus, 
  Plus, Hash, Crown, User, Camera, File
} from "lucide-react";
import { Link } from "react-router-dom";

const Sidebar = ({ onChatSelect, isMobile = false }) => {
  const { 
    getUsers, users, selectedUser, setSelectedUser, 
    selectedGroup, setSelectedGroup, getGroups, groups,
    isUsersLoading, isGroupsLoading, chatType, totalUnreadCount
  } = useChatStore();
  
  const { onlineUsers, authUser } = useAuthStore();
  const { friends } = useFriendStore();
  const { getMyGroups } = useGroupStore();
  const { isSmallMobile, isMediumMobile, showMobileLayout } = useResponsive();
  
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState('chats');
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  useEffect(() => {
    getUsers();
    getGroups();
    getMyGroups();
  }, [getUsers, getGroups, getMyGroups]);

  // Enhanced formatLastMessage function
  const formatLastMessage = (lastMessage, isGroup = false) => {
    if (!lastMessage) return '';
    
    const isOwn = lastMessage.senderId._id === authUser?._id;
    const senderName = isOwn ? 'You' : (isGroup ? lastMessage.senderId.fullName : '');
    
    let messageText = '';
    
    if (lastMessage.file) {
      const fileType = lastMessage.file.fileType;
      const fileName = lastMessage.file.originalName;
      
      switch (fileType) {
        case 'image':
          messageText = '📷 Photo';
          break;
        case 'video':
          messageText = '🎬 Video';
          break;
        case 'audio':
          messageText = '🎵 Audio';
          break;
        case 'document':
          messageText = '📄 Document';
          break;
        default:
          messageText = '📎 File';
      }
      
      // Mobile: shorter file names
      if (fileName && fileName.length <= (showMobileLayout ? 15 : 20)) {
        messageText += `: ${fileName}`;
      }
    }
    else if (lastMessage.image) {
      messageText = '📷 Photo';
    }
    else if (lastMessage.text) {
      // Mobile: shorter text preview
      const maxLength = showMobileLayout ? 25 : 30;
      messageText = lastMessage.text.length > maxLength 
        ? lastMessage.text.substring(0, maxLength) + '...' 
        : lastMessage.text;
    }
    
    return isGroup 
      ? `${senderName}: ${messageText}`
      : messageText;
  };

  const formatTime = (date) => {
    if (!date) return '';
    
    const now = new Date();
    const messageDate = new Date(date);
    const diffTime = now - messageDate;
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) return 'now';
    if (diffMinutes < 60) return `${diffMinutes}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return messageDate.toLocaleDateString('en-US', { weekday: 'short' });
    
    return messageDate.toLocaleDateString('en-US', { 
      month: showMobileLayout ? 'numeric' : 'short', 
      day: 'numeric' 
    });
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOnlineFilter = showOnlineOnly ? onlineUsers.includes(user._id) : true;
    return matchesSearch && matchesOnlineFilter;
  });

  const filteredGroups = groups.filter((group) => {
    return group.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    onChatSelect?.();
  };

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    onChatSelect?.();
  };

  if (isUsersLoading && isGroupsLoading) return <SidebarSkeleton />;

  return (
    <>
      <aside className="h-full bg-base-100 flex flex-col w-full">
        
        {/* Header with Tabs */}
        <div className={`border-b border-base-300 ${showMobileLayout ? 'p-3' : 'p-4'}`}>
          
          {/* Logo/Title Section */}
          <div className="flex items-center gap-3 mb-4">
            <div className={`bg-primary text-primary-content rounded-lg flex items-center justify-center relative ${
              showMobileLayout ? 'w-8 h-8' : 'w-10 h-10'
            }`}>
              <MessageCircle className={`${showMobileLayout ? 'w-4 h-4' : 'w-6 h-6'}`} />
              {totalUnreadCount > 0 && (
                <div className={`absolute bg-error text-error-content font-bold rounded-full flex items-center justify-center ${
                  showMobileLayout 
                    ? '-top-1 -right-1 w-4 h-4 text-xs' 
                    : '-top-2 -right-2 w-5 h-5 text-xs'
                }`}>
                  {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                </div>
              )}
            </div>
            
            {/* Always show title unless very small mobile */}
            {!isSmallMobile && (
              <div>
                <h2 className={`font-bold text-base-content ${
                  showMobileLayout ? 'text-base' : 'text-lg'
                }`}>
                  Chatty
                </h2>
                <p className={`font-medium text-base-content/80 ${
                  showMobileLayout ? 'text-xs' : 'text-sm'
                }`}>
                  Stay connected
                </p>
              </div>
            )}
          </div>

          {/* Desktop Tabs */}
          {!showMobileLayout && (
            <div className="mb-4">
              <div className="tabs tabs-boxed bg-base-200">
                <button
                  className={`tab flex-1 ${activeTab === 'chats' ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab('chats')}
                >
                  <User className="w-4 h-4 mr-2" />
                  Chats
                  {users.reduce((sum, user) => sum + (user.unreadCount || 0), 0) > 0 && (
                    <div className="badge badge-error badge-sm ml-2 text-white">
                      {users.reduce((sum, user) => sum + (user.unreadCount || 0), 0)}
                    </div>
                  )}
                </button>
                <button
                  className={`tab flex-1 ${activeTab === 'groups' ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab('groups')}
                >
                  <Hash className="w-4 h-4 mr-2" />
                  Groups
                  {groups.reduce((sum, group) => sum + (group.unreadCount || 0), 0) > 0 && (
                    <div className="badge badge-error badge-sm ml-2 text-white">
                      {groups.reduce((sum, group) => sum + (group.unreadCount || 0), 0)}
                    </div>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Mobile Tab Selector */}
          {showMobileLayout && (
            <div className="flex justify-center gap-2 mb-4">
              <button
                onClick={() => setActiveTab('chats')}
                className={`btn btn-sm relative ${
                  activeTab === 'chats' ? 'btn-primary' : 'btn-ghost'
                }`}
              >
                <User className="w-4 h-4" />
                <span className="ml-1">Chats</span>
                {users.reduce((sum, user) => sum + (user.unreadCount || 0), 0) > 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-error text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {users.reduce((sum, user) => sum + (user.unreadCount || 0), 0) > 9 ? '9+' : users.reduce((sum, user) => sum + (user.unreadCount || 0), 0)}
                  </div>
                )}
              </button>
              
              <button
                onClick={() => setActiveTab('groups')}
                className={`btn btn-sm relative ${
                  activeTab === 'groups' ? 'btn-primary' : 'btn-ghost'
                }`}
              >
                <Hash className="w-4 h-4" />
                <span className="ml-1">Groups</span>
                {groups.reduce((sum, group) => sum + (group.unreadCount || 0), 0) > 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-error text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {groups.reduce((sum, group) => sum + (group.unreadCount || 0), 0) > 9 ? '9+' : groups.reduce((sum, group) => sum + (group.unreadCount || 0), 0)}
                  </div>
                )}
              </button>
              
              <button
                onClick={() => setShowCreateGroup(true)}
                className="btn btn-sm btn-success"
              >
                <Plus className="w-4 h-4" />
                <span className="ml-1">New</span>
              </button>
            </div>
          )}

          {/* Desktop Search Bar */}
          {!showMobileLayout && (
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-base-content/50" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input input-bordered input-sm w-full pl-10"
                />
              </div>
            </div>
          )}

          {/* Desktop Controls */}
          {!showMobileLayout && (
            <div className="flex items-center justify-between">
              {activeTab === 'chats' ? (
                <>
                  <label className="label cursor-pointer p-0">
                    <input
                      type="checkbox"
                      checked={showOnlineOnly}
                      onChange={(e) => setShowOnlineOnly(e.target.checked)}
                      className="checkbox checkbox-sm checkbox-primary"
                    />
                    <span className="label-text ml-2 font-semibold text-base-content">
                      Online only
                    </span>
                  </label>
                  <Link to="/friends" className="btn btn-primary btn-xs">
                    <UserPlus className="w-3 h-3" />
                    Add Friends
                  </Link>
                </>
              ) : (
                <>
                  <span className="text-sm font-medium text-base-content/80">
                    Your groups
                  </span>
                  <button
                    onClick={() => setShowCreateGroup(true)}
                    className="btn btn-success btn-xs"
                  >
                    <Plus className="w-3 h-3" />
                    New Group
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scroll-smooth-mobile">
          {activeTab === 'chats' ? (
            /* Friends/Chats List */
            filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                {users.length === 0 ? (
                  <>
                    <Users className={`text-base-content/30 mb-3 ${
                      showMobileLayout ? 'w-10 h-10' : 'w-12 h-12'
                    }`} />
                    <p className={`font-medium text-base-content/70 mb-2 ${
                      showMobileLayout ? 'text-sm' : 'text-sm'
                    }`}>
                      No friends to chat with
                    </p>
                    <Link to="/friends" className={`btn btn-primary ${
                      showMobileLayout ? 'btn-sm' : 'btn-sm'
                    }`}>
                      <UserPlus className="w-4 h-4" />
                      Add Friends
                    </Link>
                  </>
                ) : (
                  <>
                    <Search className={`text-base-content/30 mb-2 ${
                      showMobileLayout ? 'w-6 h-6' : 'w-8 h-8'
                    }`} />
                    <p className={`text-base-content/70 ${
                      showMobileLayout ? 'text-sm' : 'text-sm'
                    }`}>
                      {searchTerm ? 'No friends found' : 'No online friends'}
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className={`space-y-1 ${showMobileLayout ? 'p-2' : 'p-2'}`}>
                {filteredUsers.map((user) => {
                  const isSelected = selectedUser?._id === user._id && chatType === 'direct';
                  const hasUnread = user.unreadCount > 0;
                  
                  return (
                    <button
                      key={user._id}
                      onClick={() => handleUserSelect(user)}
                      className={`w-full flex items-center gap-3 rounded-lg transition-all duration-200 relative touch-manipulation tap-highlight-none btn-touch ${
                        showMobileLayout ? 'p-3' : 'p-3'
                      } ${
                        isSelected
                          ? "bg-primary text-primary-content shadow-md"
                          : hasUnread
                          ? "bg-base-200 hover:bg-base-300 active:bg-base-300"
                          : "hover:bg-base-200 active:bg-base-200 text-base-content"
                      }`}
                    >
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <img
                          src={user.profilePic || "/avatar.png"}
                          alt={user.fullName}
                          className={`rounded-full object-cover border-2 border-base-300 ${
                            showMobileLayout ? 'w-12 h-12' : 'w-12 h-12'
                          }`}
                        />
                        {/* Online Status */}
                        {onlineUsers.includes(user._id) && (
                          <div className={`absolute bg-success border-2 border-base-100 rounded-full ${
                            showMobileLayout 
                              ? '-bottom-1 -right-1 w-4 h-4' 
                              : '-bottom-1 -right-1 w-4 h-4'
                          }`}></div>
                        )}
                        {/* Unread Badge on Avatar (Mobile) */}
                        {hasUnread && showMobileLayout && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-error text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {user.unreadCount > 99 ? '99+' : user.unreadCount}
                          </div>
                        )}
                      </div>

                      {/* User Info - ALWAYS SHOW THE NAME */}
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className={`font-bold truncate ${
                            showMobileLayout ? 'text-sm' : 'text-sm'
                          } ${
                            isSelected
                              ? "text-primary-content"
                              : hasUnread
                              ? "text-base-content"
                              : "text-base-content"
                          }`}>
                            {user.fullName}
                          </h3>
                          {/* Time stamp */}
                          {user.lastMessage && (
                            <span className={`text-xs flex-shrink-0 ml-2 ${
                              isSelected
                                ? "text-primary-content/70"
                                : "text-base-content/60"
                            }`}>
                              {formatTime(user.lastMessage.createdAt)}
                            </span>
                          )}
                        </div>
                        
                        {/* Last Message Preview */}
                        {user.lastMessage ? (
                          <p className={`text-xs truncate ${
                            isSelected
                              ? "text-primary-content/80"
                              : hasUnread
                              ? "text-base-content font-medium"
                              : "text-base-content/70"
                          }`}>
                            {formatLastMessage(user.lastMessage, false)}
                          </p>
                        ) : (
                          <span className={`text-xs ${
                            isSelected
                              ? onlineUsers.includes(user._id)
                                ? 'text-primary-content/80'
                                : 'text-primary-content/70'
                              : onlineUsers.includes(user._id)
                              ? 'text-success font-medium'
                              : 'text-base-content/70'
                          }`}>
                            {onlineUsers.includes(user._id) ? '● Online' : 'Offline'}
                          </span>
                        )}
                      </div>

                      {/* Desktop Unread Badge */}
                      {hasUnread && !showMobileLayout && (
                        <div className="flex w-5 h-5 bg-error text-white text-xs font-bold rounded-full items-center justify-center flex-shrink-0">
                          {user.unreadCount > 99 ? '99+' : user.unreadCount}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )
          ) : (
            /* Groups List - Similar fix for groups */
            filteredGroups.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                {groups.length === 0 ? (
                  <>
                    <Hash className={`text-base-content/30 mb-3 ${
                      showMobileLayout ? 'w-10 h-10' : 'w-12 h-12'
                    }`} />
                    <p className={`font-medium text-base-content/70 mb-2 ${
                      showMobileLayout ? 'text-sm' : 'text-sm'
                    }`}>
                      No groups yet
                    </p>
                    <button
                      onClick={() => setShowCreateGroup(true)}
                      className={`btn btn-success ${showMobileLayout ? 'btn-sm' : 'btn-sm'}`}
                    >
                      <Plus className="w-4 h-4" />
                      Create Group
                    </button>
                  </>
                ) : (
                  <>
                    <Search className={`text-base-content/30 mb-2 ${
                      showMobileLayout ? 'w-6 h-6' : 'w-8 h-8'
                    }`} />
                    <p className={`text-base-content/70 ${
                      showMobileLayout ? 'text-sm' : 'text-sm'
                    }`}>
                      No groups found
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className={`space-y-1 ${showMobileLayout ? 'p-2' : 'p-2'}`}>
                {filteredGroups.map((group) => {
                  const memberCount = group.members?.length || 0;
                  const isSelected = selectedGroup?._id === group._id && chatType === 'group';
                  const hasUnread = group.unreadCount > 0;
                  const userMember = group.members?.find(member => 
                    member.user._id === authUser?._id
                  );
                  const isAdmin = userMember?.role === 'admin';

                  return (
                    <button
                      key={group._id}
                      onClick={() => handleGroupSelect(group)}
                      className={`w-full flex items-center gap-3 rounded-lg transition-all duration-200 relative touch-manipulation tap-highlight-none btn-touch ${
                        showMobileLayout ? 'p-3' : 'p-3'
                      } ${
                        isSelected
                          ? "bg-primary text-primary-content shadow-md"
                          : hasUnread
                          ? "bg-base-200 hover:bg-base-300 active:bg-base-300"
                          : "hover:bg-base-200 active:bg-base-200 text-base-content"
                      }`}
                    >
                      {/* Group Avatar */}
                      <div className="relative flex-shrink-0">
                        {group.groupPic ? (
                          <img
                            src={group.groupPic}
                            alt={group.name}
                            className={`rounded-full object-cover border-2 border-base-300 ${
                              showMobileLayout ? 'w-12 h-12' : 'w-12 h-12'
                            }`}
                          />
                        ) : (
                          <DefaultGroupIcon 
                            className={showMobileLayout ? "w-12 h-12" : "w-12 h-12"} 
                            iconClassName={showMobileLayout ? "w-5 h-5" : "w-5 h-5"} 
                          />
                        )}
                        
                        {/* Admin Badge */}
                        {isAdmin && (
                          <div className={`absolute bg-warning border-2 border-base-100 rounded-full flex items-center justify-center ${
                            showMobileLayout 
                              ? '-bottom-1 -right-1 w-4 h-4' 
                              : '-bottom-1 -right-1 w-4 h-4'
                          }`}>
                            <Crown className={`text-warning-content ${
                              showMobileLayout ? 'w-2 h-2' : 'w-2 h-2'
                            }`} />
                          </div>
                        )}
                        
                        {/* Unread Badge on Avatar (Mobile) */}
                        {hasUnread && showMobileLayout && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-error text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {group.unreadCount > 99 ? '99+' : group.unreadCount}
                          </div>
                        )}
                      </div>

                      {/* Group Info - ALWAYS SHOW THE NAME */}
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className={`font-bold truncate ${
                            showMobileLayout ? 'text-sm' : 'text-sm'
                          } ${
                            isSelected
                              ? "text-primary-content"
                              : hasUnread
                              ? "text-base-content"
                              : "text-base-content"
                          }`}>
                            {group.name}
                          </h3>
                          {/* Time stamp */}
                          {group.lastMessage && (
                            <span className={`text-xs flex-shrink-0 ml-2 ${
                              isSelected
                                ? "text-primary-content/70"
                                : "text-base-content/60"
                            }`}>
                              {formatTime(group.lastMessage.createdAt)}
                            </span>
                          )}
                        </div>
                        
                        {/* Last Message Preview */}
                        {group.lastMessage ? (
                          <p className={`text-xs truncate ${
                            isSelected
                              ? "text-primary-content/80"
                              : hasUnread
                              ? "text-base-content font-medium"
                              : "text-base-content/70"
                          }`}>
                            {formatLastMessage(group.lastMessage, true)}
                          </p>
                        ) : (
                          <p className={`text-xs ${
                            isSelected
                              ? "text-primary-content/80"
                              : "text-base-content/70"
                          }`}>
                            {memberCount} member{memberCount !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>

                      {/* Desktop Unread Badge */}
                      {hasUnread && !showMobileLayout && (
                        <div className="flex w-5 h-5 bg-error text-white text-xs font-bold rounded-full items-center justify-center flex-shrink-0">
                          {group.unreadCount > 99 ? '99+' : group.unreadCount}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )
          )}
        </div>

        {/* Mobile Search */}
        {showMobileLayout && (
          <div className="border-t border-base-300 p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-base-content/50" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input input-bordered input-sm w-full pl-10 input-mobile"
              />
            </div>
          </div>
        )}
      </aside>

      {/* Create Group Modal */}
      <CreateGroup
        isOpen={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
      />
    </>
  );
};

export default Sidebar;