// components/GroupInfo.jsx
import { useState, useEffect } from "react";
import { useGroupStore } from "../store/useGroupStore";
import { useAuthStore } from "../store/useAuthStore";
import { 
  X, Users, Crown, Settings, UserPlus, UserMinus, 
  MoreVertical, Shield, Hash, Calendar, Edit3,
  LogOut, Trash2, ChevronRight
} from "lucide-react";
import ManageMembers from "./ManageMembers";
import GroupSettings from "./GroupSettings";

const GroupInfo = ({ group, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('info');
  const [showManageMembers, setShowManageMembers] = useState(false);
  const [showGroupSettings, setShowGroupSettings] = useState(false);
  
  const { authUser } = useAuthStore();
  const { 
    currentGroup, 
    getGroupDetails, 
    removeMember, 
    updateMemberRole, 
    leaveGroup, 
    deleteGroup 
  } = useGroupStore();

  const groupData = currentGroup || group;

  useEffect(() => {
    if (isOpen && group) {
      getGroupDetails(group._id);
    }
  }, [isOpen, group]);

  if (!isOpen || !groupData) return null;

  const userMember = groupData.members?.find(
    member => member.user._id === authUser._id
  );
  const isAdmin = userMember?.role === 'admin';
  const isCreator = groupData._id === authUser._id;
  const memberCount = groupData.members?.length || 0;

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

  const handleLeaveGroup = async () => {
    if (window.confirm('Are you sure you want to leave this group?')) {
      await leaveGroup(groupData._id);
      onClose();
    }
  };

  const handleDeleteGroup = async () => {
    if (window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      await deleteGroup(groupData._id);
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-base-100 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-base-300">
            <h2 className="text-xl font-bold text-base-content flex items-center gap-2">
              <Hash className="w-6 h-6 text-primary" />
              Group Info
            </h2>
            <button
              onClick={onClose}
              className="btn btn-ghost btn-sm btn-circle"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            
            {/* Group Profile Section */}
            <div className="text-center mb-8">
              <div className="relative inline-block">
                <img
                  src={groupData.groupPic || "avatar.png"}
                  alt={groupData.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-base-300 shadow-lg"
                />
                {groupData.settings?.isPrivate && (
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-secondary border-2 border-base-100 rounded-full flex items-center justify-center">
                    <Shield className="w-4 h-4 text-secondary-content" />
                  </div>
                )}
              </div>
              
              <h3 className="text-2xl font-bold text-base-content mt-4 mb-2">
                {groupData.name}
              </h3>
              
              {groupData.description && (
                <p className="text-base-content/70 max-w-md mx-auto">
                  {groupData.description}
                </p>
              )}
              
              <div className="flex items-center justify-center gap-4 mt-4 text-sm text-base-content/60">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {memberCount} member{memberCount !== 1 ? 's' : ''}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Created {new Date(groupData.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {isAdmin && (
                <>
                  <button
                    onClick={() => setShowManageMembers(true)}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    Manage Members
                  </button>
                  <button
                    onClick={() => setShowGroupSettings(true)}
                    className="btn btn-outline flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Group Settings
                  </button>
                </>
              )}
              
              <button
                onClick={handleLeaveGroup}
                className={`btn btn-warning ${isAdmin ? 'col-span-1' : 'col-span-2'} flex items-center gap-2`}
              >
                <LogOut className="w-4 h-4" />
                Leave Group
              </button>
              
              {isCreator && (
                <button
                  onClick={handleDeleteGroup}
                  className="btn btn-error flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Group
                </button>
              )}
            </div>

            {/* Members List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-base-content">
                  Members ({memberCount})
                </h4>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto">
                {groupData.members?.map((member) => {
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
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Manage Members Modal */}
      <ManageMembers
        group={groupData}
        isOpen={showManageMembers}
        onClose={() => setShowManageMembers(false)}
      />

      {/* Group Settings Modal */}
      <GroupSettings
        group={groupData}
        isOpen={showGroupSettings}
        onClose={() => setShowGroupSettings(false)}
      />
    </>
  );
};

export default GroupInfo;