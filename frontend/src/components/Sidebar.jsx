// Update your existing Sidebar.jsx to include groups
import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useFriendStore } from "../store/useFriendStore";
import { useGroupStore } from "../store/useGroupStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import CreateGroup from "./CreateGroup";
import { 
  Users, Search, Filter, MessageCircle, UserPlus, 
  Plus, Hash, Crown, User
} from "lucide-react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  const { 
    getUsers, users, selectedUser, setSelectedUser, 
    selectedGroup, setSelectedGroup, getGroups, groups,
    isUsersLoading, isGroupsLoading, chatType 
  } = useChatStore();
  
  const { onlineUsers } = useAuthStore();
  const { friends } = useFriendStore();
  const { getMyGroups } = useGroupStore();
  
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState('chats'); // 'chats' or 'groups'
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  useEffect(() => {
    getUsers();
    getGroups();
    getMyGroups();
  }, [getUsers, getGroups, getMyGroups]);

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
  };

  const handleGroupSelect = (group) => {
    console.log("Selecting group:", group); // Add this for debugging
    setSelectedGroup(group);
  };

  if (isUsersLoading && isGroupsLoading) return <SidebarSkeleton />;

  return (
    <>
      <aside className="h-full w-20 lg:w-80 bg-base-100 border-r border-base-300 flex flex-col">
        
        {/* Header with Tabs */}
        <div className="p-4 border-b border-base-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-primary text-primary-content rounded-lg flex items-center justify-center lg:w-10 lg:h-10">
              <MessageCircle className="w-5 h-5 lg:w-6 lg:h-6" />
            </div>
            <div className="hidden lg:block">
              <h2 className="text-lg font-bold text-base-content">Chatty</h2>
              <p className="text-sm font-medium text-base-content/80">
                Stay connected
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="hidden lg:block mb-4">
            <div className="tabs tabs-boxed bg-base-200">
              <button
                className={`tab flex-1 ${activeTab === 'chats' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('chats')}
              >
                <User className="w-4 h-4 mr-2" />
                Chats
                {users.length > 0 && (
                  <div className="badge badge-sm ml-2">{users.length}</div>
                )}
              </button>
              <button
                className={`tab flex-1 ${activeTab === 'groups' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('groups')}
              >
                <Hash className="w-4 h-4 mr-2" />
                Groups
                {groups.length > 0 && (
                  <div className="badge badge-sm ml-2">{groups.length}</div>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Tab Selector */}
          <div className="lg:hidden flex justify-center gap-2 mb-4">
            <button
              onClick={() => setActiveTab('chats')}
              className={`btn btn-sm ${activeTab === 'chats' ? 'btn-primary' : 'btn-ghost'}`}
            >
              <User className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`btn btn-sm ${activeTab === 'groups' ? 'btn-primary' : 'btn-ghost'}`}
            >
              <Hash className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowCreateGroup(true)}
              className="btn btn-sm btn-success"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="hidden lg:block mb-4">
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

          {/* Controls */}
          <div className="hidden lg:flex items-center justify-between">
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
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'chats' ? (
            /* Friends/Chats List */
            filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                {users.length === 0 ? (
                  <>
                    <Users className="w-12 h-12 text-base-content/30 mb-3" />
                    <p className="text-sm font-medium text-base-content/70 mb-2">
                      No friends to chat with
                    </p>
                    <Link to="/friends" className="btn btn-primary btn-sm">
                      <UserPlus className="w-4 h-4" />
                      Add Friends
                    </Link>
                  </>
                ) : (
                  <>
                    <Search className="w-8 h-8 text-base-content/30 mb-2" />
                    <p className="text-sm text-base-content/70">
                      {searchTerm ? 'No friends found' : 'No online friends'}
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {filteredUsers.map((user) => (
                  <button
                    key={user._id}
                    onClick={() => handleUserSelect(user)}
                    className={`w-full p-3 flex items-center gap-3 rounded-lg transition-all duration-200 ${
                      selectedUser?._id === user._id && chatType === 'direct'
                        ? "bg-primary text-primary-content shadow-md"
                        : "hover:bg-base-200 text-base-content"
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={user.profilePic || "/avatar.png"}
                        alt={user.fullName}
                        className="w-12 h-12 rounded-full object-cover border-2 border-base-300"
                      />
                      {onlineUsers.includes(user._id) && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success border-2 border-base-100 rounded-full"></div>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="hidden lg:block flex-1 text-left min-w-0">
                      <h3 className={`font-bold text-sm truncate ${
                        selectedUser?._id === user._id && chatType === 'direct'
                          ? "text-primary-content"
                          : "text-base-content"
                      }`}>
                        {user.fullName}
                      </h3>
                      <span className={`text-xs font-bold ${
                        selectedUser?._id === user._id && chatType === 'direct'
                          ? onlineUsers.includes(user._id)
                            ? 'text-primary-content'
                            : 'text-primary-content/80'
                          : onlineUsers.includes(user._id)
                          ? 'text-success font-extrabold'
                          : 'text-base-content/70'
                      }`}>
                        {onlineUsers.includes(user._id) ? '● Online' : 'Offline'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )
          ) : (
            /* Groups List */
            filteredGroups.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                {groups.length === 0 ? (
                  <>
                    <Hash className="w-12 h-12 text-base-content/30 mb-3" />
                    <p className="text-sm font-medium text-base-content/70 mb-2">
                      No groups yet
                    </p>
                    <button
                      onClick={() => setShowCreateGroup(true)}
                      className="btn btn-success btn-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Create Group
                    </button>
                  </>
                ) : (
                  <>
                    <Search className="w-8 h-8 text-base-content/30 mb-2" />
                    <p className="text-sm text-base-content/70">
                      No groups found
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {filteredGroups.map((group) => {
                  const memberCount = group.members?.length || 0;
                  const isAdmin = group.members?.some(member => 
                    member.user._id === selectedUser?._id && member.role === 'admin'
                  );

                  return (
                    <button
                      key={group._id}
                      onClick={() => handleGroupSelect(group)}
                      className={`w-full p-3 flex items-center gap-3 rounded-lg transition-all duration-200 ${
                        selectedGroup?._id === group._id && chatType === 'group'
                          ? "bg-primary text-primary-content shadow-md"
                          : "hover:bg-base-200 text-base-content"
                      }`}
                    >
                      {/* Group Avatar */}
                      <div className="relative flex-shrink-0">
                        <img
                          src={group.groupPic || "avatar.png"}
                          alt={group.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-base-300"
                        />
                        {isAdmin && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-warning border-2 border-base-100 rounded-full flex items-center justify-center">
                            <Crown className="w-2 h-2 text-warning-content" />
                          </div>
                        )}
                      </div>

                      {/* Group Info */}
                      <div className="hidden lg:block flex-1 text-left min-w-0">
                        <h3 className={`font-bold text-sm truncate ${
                          selectedGroup?._id === group._id && chatType === 'group'
                            ? "text-primary-content"
                            : "text-base-content"
                        }`}>
                          {group.name}
                        </h3>
                        <p className={`text-xs ${
                          selectedGroup?._id === group._id && chatType === 'group'
                            ? "text-primary-content/80"
                            : "text-base-content/70"
                        }`}>
                          {memberCount} member{memberCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )
          )}
        </div>

        {/* Mobile Search */}
        <div className="lg:hidden border-t border-base-300 p-3">
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