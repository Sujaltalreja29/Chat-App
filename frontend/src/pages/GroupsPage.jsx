// pages/GroupsPage.jsx
import { useEffect, useState } from "react";
import { useGroupStore } from "../store/useGroupStore";
import { useAuthStore } from "../store/useAuthStore"; // ADD THIS LINE
import CreateGroup from "../components/CreateGroup";
import { 
  Hash, Plus, Search, Users, Crown, Settings, 
  MessageCircle, MoreVertical, LogOut, UserMinus 
} from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useNavigate } from "react-router-dom";

const GroupsPage = () => {
  const navigate = useNavigate();
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { authUser } = useAuthStore(); // ADD THIS LINE
  const {
    groups,
    isGroupsLoading,
    getMyGroups,
    leaveGroup,
    deleteGroup,
    searchGroups,
    searchResults,
    isSearching,
    joinGroup 
  } = useGroupStore();

  const { setSelectedGroup } = useChatStore();

  useEffect(() => {
    getMyGroups();
  }, [getMyGroups]);

  useEffect(() => {
    if (searchQuery.trim()) {
      searchGroups(searchQuery);
    }
  }, [searchQuery, searchGroups]);

  const handleStartChat = (group) => {
    setSelectedGroup(group);
    navigate('/');
  };

  const handleLeaveGroup = async (groupId) => {
    if (window.confirm('Are you sure you want to leave this group?')) {
      await leaveGroup(groupId);
    }
  };

    // ADD THIS MISSING FUNCTION
const handleJoinGroup = async (groupId) => {
  try {
    await joinGroup(groupId);
  } catch (error) {
    // Error handled in store
  }
};

  const handleDeleteGroup = async (groupId) => {
    if (window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      await deleteGroup(groupId);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 pt-16">
      <div className="max-w-6xl mx-auto p-4 py-8">
        
        {/* Header */}
<div className="text-center mb-6">
  <h1 className="text-2xl md:text-3xl font-bold flex items-center justify-center gap-2">
    <Hash className="w-6 h-6 md:w-8 md:h-8 text-primary" />
    Groups
  </h1>
</div>

        <div className="grid gap-8 lg:grid-cols-3">
          
          {/* Left Column - Search & Discovery */}
          <div className="space-y-6">
            
            {/* Create Group Card */}
            <div className="card bg-base-100 shadow-xl border border-base-300">
              <div className="card-body text-center">
                <Hash className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="card-title justify-center mb-2">Create New Group</h3>
                <p className="text-base-content/70 mb-4">
                  Start a new community with your friends
                </p>
                <button
                  onClick={() => setShowCreateGroup(true)}
                  className="btn btn-primary"
                >
                  <Plus className="w-4 h-4" />
                  Create Group
                </button>
              </div>
            </div>

            {/* Search Groups */}
            <div className="card bg-base-100 shadow-xl border border-base-300">
              <div className="card-body">
                <h3 className="card-title mb-4 flex items-center gap-2">
                  <Search className="w-5 h-5 text-primary" />
                  Discover Groups
                </h3>

                {/* Search Input */}
                <div className="form-control">
                  <input
                    type="text"
                    placeholder="Search public groups..."
                    value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                    className="input input-bordered w-full"
                  />
                </div>

                {/* Search Results */}
                {isSearching ? (
                  <div className="flex items-center justify-center py-8">
                    <span className="loading loading-spinner loading-md"></span>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-3 mt-4">
                    {searchResults.map((group) => (
                      <div
                        key={group._id}
                        className="flex items-center gap-3 p-3 bg-base-200 rounded-lg"
                      >
                        <img
                          src={group.groupPic || "/avatar.png"}
                          alt={group.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-base-300"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-base-content truncate">
                            {group.name}
                          </h4>
                          <p className="text-sm text-base-content/70">
                            {group.memberCount} members
                          </p>
                        </div>
                        <button
                          onClick={() => handleJoinGroup(group._id)}
                          className="btn btn-primary btn-sm"
                        >
                          Join
                        </button>
                      </div>
                    ))}
                  </div>
                ) : searchQuery.trim() && !isSearching ? (
                  <div className="text-center py-8">
                    <Search className="w-8 h-8 text-base-content/30 mx-auto mb-2" />
                    <p className="text-base-content/70">No groups found</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Hash className="w-8 h-8 text-base-content/30 mx-auto mb-2" />
                    <p className="text-base-content/70">Search for public groups to join</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - My Groups */}
          <div className="lg:col-span-2">
            <div className="card bg-base-100 shadow-xl border border-base-300">
              <div className="card-body">
                <h2 className="card-title text-base-content mb-4 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Hash className="w-5 h-5 text-primary" />
                    My Groups
                    {groups.length > 0 && (
                      <div className="badge badge-primary">{groups.length}</div>
                    )}
                  </span>
                </h2>

                {isGroupsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <span className="loading loading-spinner loading-lg"></span>
                  </div>
                ) : groups.length === 0 ? (
                  <div className="text-center py-12">
                    <Hash className="w-16 h-16 text-base-content/30 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-base-content mb-2">
                      No groups yet
                    </h3>
                    <p className="text-base-content/70 mb-4">
                      Create your first group or join existing ones to start chatting!
                    </p>
                    <button
                      onClick={() => setShowCreateGroup(true)}
                      className="btn btn-primary"
                    >
                      <Plus className="w-4 h-4" />
                      Create Your First Group
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {groups.map((group) => {
                      const memberCount = group.members?.length || 0;
                      const userMember = group.members?.find(member => 
                        member.user._id === authUser?._id
                      );
                      const isAdmin = userMember?.role === 'admin';
                      const isCreator = group.createdBy._id === authUser?._id;

                      return (
                        <div
                          key={group._id}
                          className="card bg-base-200 border border-base-300 hover:shadow-md transition-shadow"
                        >
                          <div className="card-body p-3 md:p-4">
                            {/* Group Header */}
                            <div className="flex items-center gap-3 mb-3">
                              <div className="relative">
                                <img
                                  src={group.groupPic || "/avatar.png"}
                                  alt={group.name}
                                  className="w-12 h-12 rounded-full object-cover border-2 border-base-300"
                                />
                                {isAdmin && (
                                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-warning border-2 border-base-100 rounded-full flex items-center justify-center">
                                    <Crown className="w-2 h-2 text-warning-content" />
                                  </div>
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-base-content truncate flex items-center gap-2">
                                  {group.name}
                                  {group.settings?.isPrivate && (
                                    <div className="badge badge-secondary badge-xs">Private</div>
                                  )}
                                </h3>
                                <p className="text-sm text-base-content/70">
                                  {memberCount} member{memberCount !== 1 ? 's' : ''}
                                </p>
                              </div>

                              {/* Group Menu */}
                              <div className="dropdown dropdown-end">
                                <button className="btn btn-ghost btn-sm btn-circle">
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                                <ul className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 border border-base-300">
                                  <li>
                                    <button
                                      onClick={() => handleStartChat(group)}
                                      className="flex items-center gap-2"
                                    >
                                      <MessageCircle className="w-4 h-4" />
                                      Open Chat
                                    </button>
                                  </li>
                                  <li>
                                    <button className="flex items-center gap-2">
                                      <Users className="w-4 h-4" />
                                      Group Info
                                    </button>
                                  </li>
                                  {isAdmin && (
                                    <li>
                                      <button className="flex items-center gap-2">
                                        <Settings className="w-4 h-4" />
                                        Group Settings
                                      </button>
                                    </li>
                                  )}
                                  <div className="divider my-1"></div>
                                  <li>
                                    <button 
                                      onClick={() => handleLeaveGroup(group._id)}
                                      className="flex items-center gap-2 text-warning hover:bg-warning hover:text-warning-content"
                                    >
                                      <LogOut className="w-4 h-4" />
                                      Leave Group
                                    </button>
                                  </li>
                                  {isCreator && (
                                    <li>
                                      <button 
                                        onClick={() => handleDeleteGroup(group._id)}
                                        className="flex items-center gap-2 text-error hover:bg-error hover:text-error-content"
                                      >
                                        <UserMinus className="w-4 h-4" />
                                        Delete Group
                                      </button>
                                    </li>
                                  )}
                                </ul>
                              </div>
                            </div>

                            {/* Group Description */}
                            {group.description && (
                              <p className="text-sm text-base-content/70 mb-3 line-clamp-2">
                                {group.description}
                              </p>
                            )}

                            {/* Members Preview */}
                            <div className="flex items-center gap-2 mb-3">
                              <div className="flex -space-x-2">
                                {group.members?.slice(0, 4).map((member, index) => (
                                  <img
                                    key={member.user._id}
                                    src={member.user.profilePic || "/avatar.png"}
                                    alt={member.user.fullName}
                                    className="w-6 h-6 rounded-full border-2 border-base-100 object-cover"
                                  />
                                ))}
                                {memberCount > 4 && (
                                  <div className="w-6 h-6 rounded-full bg-base-300 border-2 border-base-100 flex items-center justify-center text-xs font-bold text-base-content">
                                    +{memberCount - 4}
                                  </div>
                                )}
                              </div>
                              <span className="text-xs text-base-content/60">
                                {memberCount > 1 ? 'members' : 'member'}
                              </span>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleStartChat(group)}
                                className="btn btn-primary btn-sm flex-1"
                              >
                                <MessageCircle className="w-4 h-4" />
                                <span className="hidden sm:inline">Chat</span>
                              </button>
                              <button className="btn btn-ghost btn-sm">
                                <Users className="w-4 h-4" />
                                <span className="hidden sm:inline">Info</span>
                              </button>
                            </div>

                            {/* Group Stats */}
                            <div className="mt-3 pt-3 border-t border-base-300">
                              <div className="flex justify-between text-xs text-base-content/60">
                                <span>Created {new Date(group.createdAt).toLocaleDateString()}</span>
                                <span>{isAdmin ? 'Admin' : 'Member'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Group Modal */}
      <CreateGroup
        isOpen={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
      />
    </div>
  );
};

export default GroupsPage;