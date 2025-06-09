import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Search, Filter, MessageCircle } from "lucide-react";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
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
              {users.length} contacts
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

        {/* Online Filter Toggle */}
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
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-success rounded-full"></div>
            <span className="text-xs font-medium text-base-content/80">
              {onlineUsers.length - 1} online
            </span>
          </div>
        </div>

        {/* Mobile filter button */}
        <div className="lg:hidden flex justify-center">
          <button
            onClick={() => setShowOnlineOnly(!showOnlineOnly)}
            className={`btn btn-sm btn-circle ${
              showOnlineOnly ? 'btn-primary' : 'btn-ghost'
            }`}
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto">
        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center px-4">
            <Users className="w-8 h-8 text-base-content/50 mb-2" />
            <p className="text-sm font-medium text-base-content/70">
              {searchTerm ? 'No users found' : 'No online users'}
            </p>
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

                {/* User Info - Desktop Only */}
                <div className="hidden lg:block flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-semibold text-sm truncate ${
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