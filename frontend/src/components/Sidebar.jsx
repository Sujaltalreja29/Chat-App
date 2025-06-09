// Update your existing Sidebar.jsx - just change the useEffect
import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useFriendStore } from "../store/useFriendStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Search, Filter, MessageCircle, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const { friends } = useFriendStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Now gets friends only
    getUsers();
  }, [getUsers]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOnlineFilter = showOnlineOnly ? onlineUsers.includes(user._id) : true;
    return matchesSearch && matchesOnlineFilter;
  });

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-80 bg-base-100 border-r border-base-300 flex flex-col">
      
      {/* Header */}
      <div className="p-4 border-b border-base-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-primary text-primary-content rounded-lg flex items-center justify-center lg:w-10 lg:h-10">
            <MessageCircle className="w-5 h-5 lg:w-6 lg:h-6" />
          </div>
          <div className="hidden lg:block">
            <h2 className="text-lg font-bold text-base-content">Chats</h2>
            <p className="text-sm font-medium text-base-content/80">
              {users.length} friends
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="hidden lg:block mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-base-content/50" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input input-bordered input-sm w-full pl-10"
            />
          </div>
        </div>

        {/* Online Filter & Add Friends */}
        <div className="hidden lg:flex items-center justify-between">
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
        </div>

        {/* Mobile buttons */}
        <div className="lg:hidden flex justify-center gap-2">
          <button
            onClick={() => setShowOnlineOnly(!showOnlineOnly)}
            className={`btn btn-sm btn-circle ${
              showOnlineOnly ? 'btn-primary' : 'btn-ghost'
            }`}
          >
            <Filter className="w-4 h-4" />
          </button>
          <Link to="/friends" className="btn btn-primary btn-sm btn-circle">
            <UserPlus className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Friends List */}
      <div className="flex-1 overflow-y-auto">
        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            {users.length === 0 ? (
              // No friends at all
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
              // Friends exist but filtered out
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
                onClick={() => setSelectedUser(user)}
                className={`w-full p-3 flex items-center gap-3 rounded-lg transition-all duration-200 group ${
                  selectedUser?._id === user._id
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
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-bold text-sm truncate ${
                      selectedUser?._id === user._id
                        ? "text-primary-content"
                        : "text-base-content"
                    }`}>
                      {user.fullName}
                    </h3>
                    {selectedUser?._id === user._id && (
                      <div className="w-2 h-2 bg-primary-content rounded-full"></div>
                    )}
                                    </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${
                      selectedUser?._id === user._id
                        ? onlineUsers.includes(user._id)
                          ? 'text-primary-content'
                          : 'text-primary-content/80'
                        : onlineUsers.includes(user._id)
                        ? 'text-success font-extrabold'
                        : 'text-base-content/70'
                    }`}>
                      {onlineUsers.includes(user._id) ? '● Online' : 'Offline'}
                    </span>
                    {onlineUsers.includes(user._id) && selectedUser?._id !== user._id && (
                      <div className="w-1 h-1 bg-success rounded-full animate-pulse"></div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mobile Search */}
      <div className="lg:hidden border-t border-base-300 p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-base-content/50" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input input-bordered input-sm w-full pl-10"
          />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;