// Sidebar.jsx - COMPLETE UPDATE with WhatsApp-style search
import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useFriendStore } from "../store/useFriendStore";
import { useGroupStore } from "../store/useGroupStore";
import { useSearchStore } from "../store/useSearchStore"; // ADD THIS
import { useResponsive } from "../hooks/useResponsive";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import CreateGroup from "./CreateGroup";
import DefaultGroupIcon from "./DefaultGroupIcon";
import { formatLastMessage, formatMessageTime } from '../utils/messageFormatters';
import { 
  Users, Search, Filter, MessageCircle, UserPlus, 
  Plus, Hash, Crown, User, Camera, File, X, ArrowLeft, Clock,
  MessageSquare
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
  
  // ADD SEARCH STORE
  const { 
    showGlobalSearch, 
    searchQuery, 
    globalSearchResults, 
    isSearching,
    searchHistory,
    toggleGlobalSearch,
    setSearchQuery,
    searchGlobal,
    searchChats,
    clearSearch,
    loadSearchHistory,
    clearSearchHistory
  } = useSearchStore();
  
  const { isSmallMobile, isMediumMobile, showMobileLayout } = useResponsive();
  
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // Keep for local filtering
  const [activeTab, setActiveTab] = useState('chats');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [chatSearchResults, setChatSearchResults] = useState({ friends: [], groups: [] });
  const [showSearchHistory, setShowSearchHistory] = useState(false);

  useEffect(() => {
    getUsers();
    getGroups();
    getMyGroups();
    loadSearchHistory();
  }, [getUsers, getGroups, getMyGroups, loadSearchHistory]);

  // Debounced global search
useEffect(() => {
  if (!showGlobalSearch) return;
  
  const timeoutId = setTimeout(async () => {
    if (searchQuery.trim().length >= 2) {
      console.log("🔍 Starting global search for:", searchQuery);
      
      try {
        await searchGlobal(searchQuery);
        console.log("✅ Global search completed");
      } catch (error) {
        console.error("❌ Global search failed:", error);
      }
      
      try {
        const chatResults = await searchChats(searchQuery);
        setChatSearchResults(chatResults);
        console.log("✅ Chat search completed:", chatResults);
      } catch (error) {
        console.error("❌ Chat search failed:", error);
      }
    } else if (searchQuery.trim().length === 0) {
      setChatSearchResults({ friends: [], groups: [] });
    }
  }, 300);

  return () => clearTimeout(timeoutId);
}, [searchQuery, showGlobalSearch, searchGlobal, searchChats]);

  // Enhanced formatLastMessage function (keep your existing one)
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
        case 'voice':
          messageText = '🎤 Voice message';
          break;
        case 'document':
          messageText = '📄 Document';
          break;
        default:
          messageText = '📎 File';
      }
      
      if (fileName && fileName.length <= (showMobileLayout ? 15 : 20)) {
        messageText += `: ${fileName}`;
      }
    }
    else if (lastMessage.image) {
      messageText = '📷 Photo';
    }
    else if (lastMessage.text) {
      const maxLength = showMobileLayout ? 25 : 30;
      messageText = lastMessage.text.length > maxLength 
        ? lastMessage.text.substring(0, maxLength) + '...' 
        : lastMessage.text;
    }
    
    return isGroup 
      ? `${senderName}: ${messageText}`
      : messageText;
  };

    const handleGlobalSearchMessageClick = (message) => {
    console.log("🎯 Global search message clicked:", message._id);
    
    // First, navigate to the correct chat
    if (message.messageType === 'group') {
      handleGroupSelect(message.groupId);
    } else {
      const isOwn = message.senderId._id === authUser._id;
      const otherUser = isOwn ? message.receiverId : message.senderId;
      handleUserSelect(otherUser);
    }
    
    // Store the message ID to scroll to after navigation
    sessionStorage.setItem('scrollToMessageId', message._id);
    
    // Close global search
    clearSearch();
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

  // Search handlers
  const handleSearchToggle = () => {
    if (showGlobalSearch) {
      clearSearch();
      setSearchTerm(""); // Also clear local search
    } else {
      toggleGlobalSearch();
      setSearchTerm(""); // Clear local search when switching to global
    }
  };

  const handleSearchQueryChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.trim().length === 0) {
      setShowSearchHistory(true);
    } else {
      setShowSearchHistory(false);
    }
  };

  const handleSearchHistoryClick = (query) => {
    setSearchQuery(query);
    setShowSearchHistory(false);
  };

  // Regular filtering (when not in global search mode)
  const filteredUsers = users.filter((user) => {
    if (showGlobalSearch) return true; // Don't filter when in search mode
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOnlineFilter = showOnlineOnly ? onlineUsers.includes(user._id) : true;
    return matchesSearch && matchesOnlineFilter;
  });

  const filteredGroups = groups.filter((group) => {
    if (showGlobalSearch) return true; // Don't filter when in search mode
    return group.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    onChatSelect?.();
    if (showGlobalSearch) {
      clearSearch(); // Close search when selecting a chat
    }
  };

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    onChatSelect?.();
    if (showGlobalSearch) {
      clearSearch(); // Close search when selecting a chat
    }
  };

  // Highlight search terms
const highlightSearchTerm = (text, query) => {
  if (!text || !query || !showGlobalSearch) return text;
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return (
    <span>
      {parts.map((part, index) => 
        regex.test(part) ? (
          <mark key={index} className="bg-green-200 text-green-900 px-0.5 rounded font-medium">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  );
};

  if (isUsersLoading && isGroupsLoading) return <SidebarSkeleton />;

  return (
    <>
      <aside className="h-full bg-base-100 flex flex-col w-full">
        
        {/* Header with Tabs */}
        <div className={`border-b border-base-300 ${showMobileLayout ? 'p-3' : 'p-4'}`}>
          
          {/* Logo/Title Section */}
            {/* Logo/Title Section - HIDE in mobile when no chat selected */}
  {!showMobileLayout && (
    <div className="flex items-center gap-3 mb-4">
      {showGlobalSearch && showMobileLayout ? (
        // Mobile search header
        <button
          onClick={handleSearchToggle}
          className="btn btn-ghost btn-sm btn-circle"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
      ) : (
        <div className={`bg-primary text-primary-content rounded-lg flex items-center justify-center relative ${
          showMobileLayout ? 'w-8 h-8' : 'w-10 h-10'
        }`}>
          <MessageSquare className={`${showMobileLayout ? 'w-4 h-4' : 'w-6 h-6'}`} />
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
      )}
      
      {/* Title - Hide in mobile search mode */}
      {!(showGlobalSearch && showMobileLayout) && (
        <div>
          <h2 className={`font-bold text-base-content ${
            showMobileLayout ? 'text-base' : 'text-lg'
          }`}>
            {showGlobalSearch ? 'Search Messages' : 'Chatty'}
          </h2>
          <p className={`font-medium text-base-content/80 ${
            showMobileLayout ? 'text-xs' : 'text-sm'
          }`}>
            {showGlobalSearch ? 'Find messages and chats' : 'Stay connected'}
          </p>
        </div>
      )}
    </div>
  )}

{/* 🔥 WhatsApp-style Mobile header */}
{showMobileLayout && !showGlobalSearch && (
  <div className="mb-4">
    {/* Header with Avatar and Title */}
    <div className="flex items-center justify-between mb-4">
      {/* User Profile */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <img
            src={authUser?.profilePic || "/avatar.png"}
            alt={authUser?.fullName}
            className="w-10 h-10 rounded-full object-cover border-2 border-primary/20"
          />
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-success border-2 border-base-100 rounded-full"></div>
        </div>
        <div>
          <h1 className="font-bold text-base-content text-xl">Chatty</h1>
          <p className="text-xs text-base-content/70">
            Welcome back, {authUser?.fullName?.split(' ')[0]}
          </p>
        </div>
      </div>

      {/* Notification Badge */}
      {totalUnreadCount > 0 && (
        <div className="bg-error text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
          {totalUnreadCount > 99 ? '99+' : totalUnreadCount} new
        </div>
      )}
    </div>

    {/* Connection Status */}
    <div className="flex items-center justify-center gap-2 py-2 bg-success/10 rounded-lg mb-2">
      <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
      <span className="text-xs text-success font-medium">
        Connected • {onlineUsers.length - 1} friends online
      </span>
    </div>
  </div>
)}

  {/* Search header for mobile global search */}
  {showMobileLayout && showGlobalSearch && (
    <div className="flex items-center gap-3 mb-4">
      <button
        onClick={handleSearchToggle}
        className="btn btn-ghost btn-sm btn-circle"
      >
        <ArrowLeft className="w-4 h-4" />
      </button>
      <div>
        <h2 className="font-bold text-base-content text-base">Search Messages</h2>
        <p className="font-medium text-base-content/80 text-xs">Find messages and chats</p>
      </div>
    </div>
  )}

          {/* Tabs - Hide in search mode */}
          {!showGlobalSearch && (
            <>
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
                        // Sidebar.jsx (continued)
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
            </>
          )}

          {/* Search Bar */}
          <div className="mb-4">
  <div className="relative">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-base-content/50" />
    <input
      type="text"
      placeholder={showGlobalSearch ? "Search messages, chats..." : `Search ${activeTab}...`}
      value={showGlobalSearch ? searchQuery : searchTerm}
      onChange={showGlobalSearch ? handleSearchQueryChange : (e) => setSearchTerm(e.target.value)}
      onFocus={!showGlobalSearch ? () => toggleGlobalSearch() : undefined} // FIX: Use toggleGlobalSearch instead of setShowGlobalSearch
      className="input input-bordered input-sm w-full pl-10 pr-10"
    />
    {showGlobalSearch && (
      <button
        onClick={handleSearchToggle}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 btn btn-ghost btn-xs btn-circle"
      >
        <X className="w-3 h-3" />
      </button>
    )}
  </div>
</div>

          {/* Controls - Hide in search mode */}
          {!showGlobalSearch && !showMobileLayout && (
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

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto scroll-smooth-mobile">
          {showGlobalSearch ? (
            /* 🔥 GLOBAL SEARCH MODE */
            <div className="p-2">
              {/* Search History */}
              {showSearchHistory && searchHistory.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2 px-2">
                    <h4 className="text-xs font-medium text-base-content/60 flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      RECENT SEARCHES
                    </h4>
                    <button
                      onClick={clearSearchHistory}
                      className="text-xs text-base-content/60 hover:text-base-content"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="space-y-1">
                    {searchHistory.map((query, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearchHistoryClick(query)}
                        className="block w-full text-left px-3 py-2 rounded-lg hover:bg-base-200 text-sm text-base-content/70"
                      >
                        <Search className="w-3 h-3 inline mr-2" />
                        {query}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Chat Access */}
              {searchQuery && (chatSearchResults.friends.length > 0 || chatSearchResults.groups.length > 0) && (
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-base-content/60 mb-2 px-2">CHATS AND CONTACTS</h4>
                  <div className="space-y-1">
                    {/* Friends */}
                    {chatSearchResults.friends.map((friend) => (
                      <button
                        key={friend._id}
                        onClick={() => handleUserSelect(friend)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 text-left"
                      >
                        <div className="relative">
                          <img
                            src={friend.profilePic || "/avatar.png"}
                            alt={friend.fullName}
                            className="w-10 h-10 rounded-full object-cover border-2 border-base-300"
                          />
                          {onlineUsers.includes(friend._id) && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success border-2 border-base-100 rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">
                            {highlightSearchTerm(friend.fullName, searchQuery)}
                          </h3>
                          <p className="text-xs text-base-content/60">
                            {onlineUsers.includes(friend._id) ? 'Online' : 'Last seen recently'}
                          </p>
                        </div>
                      </button>
                    ))}
                    
                    {/* Groups */}
                    {chatSearchResults.groups.map((group) => (
                      <button
                        key={group._id}
                        onClick={() => handleGroupSelect(group)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 text-left"
                      >
                        <div className="relative">
                          {group.groupPic ? (
                            <img
                              src={group.groupPic}
                              alt={group.name}
                              className="w-10 h-10 rounded-full object-cover border-2 border-base-300"
                            />
                          ) : (
                            <DefaultGroupIcon className="w-10 h-10" iconClassName="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">
                            {highlightSearchTerm(group.name, searchQuery)}
                          </h3>
                          <p className="text-xs text-base-content/60">
                            {group.members?.length || 0} members
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Message Search Results */}
{searchQuery && (
  <div>
    <h4 className="text-xs font-medium text-base-content/60 mb-2 px-2 uppercase tracking-wide">
      Messages {globalSearchResults.length > 0 && `(${globalSearchResults.length})`}
    </h4>
    
    {isSearching && globalSearchResults.length === 0 ? (
      <div className="flex items-center justify-center py-8">
        <div className="loading loading-spinner loading-md"></div>
        <span className="ml-2 text-sm text-base-content/70">Searching...</span>
      </div>
    ) : globalSearchResults.length > 0 ? (
      <div className="space-y-0">
{globalSearchResults.map((message) => {
  const isOwn = message.senderId._id === authUser._id;
  const chatName = message.messageType === 'group' 
    ? message.groupId?.name 
    : (isOwn ? message.receiverId?.fullName : message.senderId?.fullName);
  const senderName = isOwn ? 'You' : message.senderId?.fullName;
  
  return (
    <button
      key={message._id}
      onClick={() => {
        // 🔥 UPDATED: Navigate to chat and then scroll to message
        handleGlobalSearchMessageClick(message);
      }}
      className="w-full p-3 hover:bg-base-200 text-left border-b border-base-200 last:border-b-0"
    >
              {/* Chat Header */}
              <div className="flex items-center gap-3 mb-2">
                {/* Chat Avatar */}
                <div className="relative flex-shrink-0">
                  {message.messageType === 'group' ? (
                    message.groupId?.groupPic ? (
                      <img
                        src={message.groupId.groupPic}
                        alt={message.groupId.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-primary text-primary-content rounded-full flex items-center justify-center">
                        <Hash className="w-5 h-5" />
                      </div>
                    )
                  ) : (
                    <img
                      src={isOwn ? message.receiverId?.profilePic : message.senderId?.profilePic || "/avatar.png"}
                      alt={chatName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  )}
                </div>

                {/* Chat Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm text-base-content truncate">
                      {chatName}
                    </h3>
                    <span className="text-xs text-base-content/60 flex-shrink-0 ml-2">
                      {formatTime(message.createdAt)}
                    </span>
                  </div>
                  
                  {/* Sender name for groups */}
                  {message.messageType === 'group' && (
                    <p className="text-xs text-base-content/70 truncate">
                      {senderName}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Message Preview with Highlighting */}
              <div className="pl-13"> {/* Align with chat info */}
                {message.text ? (
                  <p className="text-sm text-base-content/80 leading-relaxed line-clamp-2">
                    {highlightSearchTerm(message.text, searchQuery)}
                  </p>
                ) : message.file ? (
                  <div className="flex items-center gap-2">
                    <div className="badge badge-primary badge-xs">
                      {message.file.fileType}
                    </div>
                    <span className="text-sm text-base-content/80 truncate">
                      {highlightSearchTerm(message.file.originalName || 'File', searchQuery)}
                    </span>
                  </div>
                ) : message.image ? (
                  <div className="flex items-center gap-2">
                    <div className="badge badge-primary badge-xs">image</div>
                    <span className="text-sm text-base-content/80">📷 Photo</span>
                  </div>
                ) : (
                  <span className="text-sm text-base-content/60 italic">Message</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    ) : searchQuery.trim().length >= 2 ? (
      <div className="text-center py-8">
        <Search className="w-8 h-8 text-base-content/30 mb-2 mx-auto" />
        <p className="text-sm text-base-content/70">No messages found</p>
        <p className="text-xs text-base-content/50 mt-1">Try different keywords</p>
      </div>
    ) : null}
  </div>
)}
            </div>
          ) : (
            /* 🔥 NORMAL CHAT LIST MODE */
            <>
              {activeTab === 'chats' ? (
                /* Friends/Chats List */
                filteredUsers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center px-4">
                    {users.length === 0 ? (
                      <>
                        // Sidebar.jsx (continued)
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

                          {/* User Info */}
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
                /* Groups List */
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
                                src={"avatar.png"}
                                alt={group.name}
                                className={`rounded-full object-cover border-2 border-base-300 ${
                                  showMobileLayout ? 'w-12 h-12' : 'w-12 h-12'
                                }`}
                              />
                            ) : (
                              <img
                                src={"avatar.png"}
                                alt={group.name}
                                className={`rounded-full object-cover border-2 border-base-300 ${
                                  showMobileLayout ? 'w-12 h-12' : 'w-12 h-12'
                                }`}
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

                          {/* Group Info */}
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
            </>
          )}
        </div>

        {/* Mobile Search (now moved to header) */}
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