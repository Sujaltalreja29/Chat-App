// components/ManageMembers.jsx
import { useState, useEffect } from "react";
import { useGroupStore } from "../store/useGroupStore";
import { useFriendStore } from "../store/useFriendStore";
import { useAuthStore } from "../store/useAuthStore";
import { 
  X, UserPlus, Users, Search, Check, Crown, 
  UserMinus, MoreVertical, Plus, Loader
} from "lucide-react";

const ManageMembers = ({ group, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('add'); // 'add' or 'manage'
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [isAdding, setIsAdding] = useState(false);

  const { authUser } = useAuthStore();
  const { friends, getFriends } = useFriendStore();
  const { 
    addMembers, removeMember, updateMemberRole, 
    getGroupDetails, currentGroup 
  } = useGroupStore();

  const groupData = currentGroup || group;

  useEffect(() => {
    if (isOpen) {
      getFriends();
      if (group) {
        getGroupDetails(group._id);
      }
    }
  }, [isOpen, group]);

  useEffect(() => {
    // Reset selection when tab changes
    setSelectedFriends([]);
    setSearchQuery("");
  }, [activeTab]);

  if (!isOpen || !groupData) return null;

  const userMember = groupData.members?.find(
    member => member.user._id === authUser._id
  );
  const isAdmin = userMember?.role === 'admin';
  const isCreator = groupData._id === authUser._id;

  // Get friends who are not already in the group
  const availableFriends = friends.filter(friend => 
    !groupData.members?.some(member => member.user._id === friend._id)
  );

  // Filter friends based on search
  const filteredFriends = availableFriends.filter(friend =>
    friend.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter current members based on search
  const filteredMembers = groupData.members?.filter(member =>
    member.user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const toggleFriendSelection = (friendId) => {
    setSelectedFriends(prev =>
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleAddMembers = async () => {
    if (selectedFriends.length === 0) return;
    
    setIsAdding(true);
    try {
      await addMembers(groupData._id, selectedFriends);
      setSelectedFriends([]);
      setActiveTab('manage'); // Switch to manage tab after adding
    } catch (error) {
      // Error handled in store
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      await removeMember(groupData._id, memberId);
    }
  };

  const handlePromoteToAdmin = async (memberId) => {
    await updateMemberRole(groupData._id, memberId, 'admin');
  };

  const handleDemoteToMember = async (memberId) => {
    await updateMemberRole(groupData._id, memberId, 'member');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-base-300">
          <h2 className="text-xl font-bold text-base-content flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-primary" />
            Manage Members
          </h2>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-base-300">
          <button
            onClick={() => setActiveTab('add')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'add'
                ? 'text-primary border-b-2 border-primary bg-primary/10'
                : 'text-base-content/70 hover:text-base-content hover:bg-base-200'
            }`}
          >
            <UserPlus className="w-4 h-4 inline mr-2" />
            Add Members ({availableFriends.length})
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'manage'
                ? 'text-primary border-b-2 border-primary bg-primary/10'
                : 'text-base-content/70 hover:text-base-content hover:bg-base-200'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Manage ({groupData.members?.length || 0})
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          
          {/* Search */}
          <div className="form-control mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/50" />
              <input
                type="text"
                placeholder={activeTab === 'add' ? "Search friends..." : "Search members..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input input-bordered w-full pl-10"
              />
            </div>
          </div>

          {activeTab === 'add' ? (
            /* Add Members Tab */
            <>
              {/* Selected Count & Add Button */}
              {selectedFriends.length > 0 && (
                <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-base-content">
                      {selectedFriends.length} friend{selectedFriends.length !== 1 ? 's' : ''} selected
                    </span>
                    <button
                      onClick={handleAddMembers}
                      disabled={isAdding}
                      className="btn btn-primary btn-sm"
                    >
                      {isAdding ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Add to Group
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Friends List */}
              {filteredFriends.length === 0 ? (
                <div className="text-center py-12">
                  <UserPlus className="w-12 h-12 text-base-content/30 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-base-content mb-2">
                    {availableFriends.length === 0 
                      ? "All friends are already members" 
                      : searchQuery 
                        ? "No friends found" 
                        : "No friends to add"
                    }
                  </h3>
                  <p className="text-base-content/70">
                    {availableFriends.length === 0 
                      ? "Everyone in your friends list is already in this group"
                      : searchQuery 
                        ? "Try a different search term"
                        : "Add friends first to invite them to groups"
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredFriends.map((friend) => {
                    const isSelected = selectedFriends.includes(friend._id);
                    
                    return (
                      <div
                        key={friend._id}
                        onClick={() => toggleFriendSelection(friend._id)}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-primary/20 border border-primary'
                            : 'bg-base-200 hover:bg-base-300'
                        }`}
                      >
                        {/* Avatar */}
                        <img
                          src={friend.profilePic || "/avatar.png"}
                          alt={friend.fullName}
                          className="w-12 h-12 rounded-full object-cover border-2 border-base-300"
                        />

                        {/* Friend Info */}
                        <div className="flex-1">
                          <h4 className="font-semibold text-base-content">
                            {friend.fullName}
                          </h4>
                          <p className="text-sm text-base-content/70">
                            {friend.email}
                          </p>
                        </div>

                        {/* Selection Indicator */}
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          isSelected
                            ? 'bg-primary border-primary text-primary-content'
                            : 'border-base-300'
                        }`}>
                          {isSelected && <Check className="w-4 h-4" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            /* Manage Members Tab */
            <div className="space-y-3">
              {filteredMembers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-base-content/30 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-base-content mb-2">
                    No members found
                  </h3>
                  <p className="text-base-content/70">
                    Try a different search term
                  </p>
                </div>
              ) : (
                filteredMembers.map((member) => {
                  const isCurrentUser = member.user._id === authUser._id;
                  const isMemberAdmin = member.role === 'admin';
                  const isMemberCreator = member.user._id === groupData._id;

                  return (
                    <div
                      key={member.user._id}
                      className="flex items-center gap-3 p-3 bg-base-200 rounded-lg"
                    >
                      {/* Avatar */}
                      <div className="relative">
                        <img
                          src={member.user.profilePic || "/avatar.png"}
                          alt={member.user.fullName}
                          className="w-12 h-12 rounded-full object-cover border-2 border-base-300"
                        />
                        {isMemberAdmin && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-warning border-2 border-base-100 rounded-full flex items-center justify-center">
                            <Crown className="w-3 h-3 text-warning-content" />
                          </div>
                        )}
                      </div>

                      {/* Member Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h5 className="font-semibold text-base-content">
                            {member.user.fullName}
                            {isCurrentUser && (
                              <span className="text-primary ml-1">(You)</span>
                            )}
                          </h5>
                          {isMemberCreator && (
                            <div className="badge badge-success badge-sm">Creator</div>
                          )}
                          {isMemberAdmin && !isMemberCreator && (
                            <div className="badge badge-warning badge-sm">Admin</div>
                          )}
                        </div>
                        <p className="text-sm text-base-content/70">
                          {member.user.email}
                        </p>
                        <p className="text-xs text-base-content/50">
                          Joined {new Date(member.joinedAt).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Member Actions */}
                      {isAdmin && !isCurrentUser && !isMemberCreator && (
                        <div className="dropdown dropdown-end">
                          <button className="btn btn-ghost btn-sm btn-circle">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          <ul className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-48 border border-base-300">
                            {!isMemberAdmin ? (
                              <li>
                                <button
                                  onClick={() => handlePromoteToAdmin(member.user._id)}
                                  className="flex items-center gap-2"
                                >
                                  <Crown className="w-4 h-4" />
                                  Make Admin
                                </button>
                              </li>
                            ) : (
                              <li>
                                <button
                                  onClick={() => handleDemoteToMember(member.user._id)}
                                  className="flex items-center gap-2"
                                >
                                  <Users className="w-4 h-4" />
                                  Remove Admin
                                </button>
                              </li>
                            )}
                            <div className="divider my-1"></div>
                            <li>
                              <button
                                onClick={() => handleRemoveMember(member.user._id)}
                                className="flex items-center gap-2 text-error hover:bg-error hover:text-error-content"
                              >
                                <UserMinus className="w-4 h-4" />
                                Remove Member
                              </button>
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-base-300 bg-base-50">
          <div className="text-sm text-base-content/70">
            {activeTab === 'add' 
              ? `${availableFriends.length} friends available`
              : `${groupData.members?.length || 0} total members`
            }
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageMembers;