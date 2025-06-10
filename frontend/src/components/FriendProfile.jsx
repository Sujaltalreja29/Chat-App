// components/FriendProfile.jsx
import { useState, useEffect } from "react";
import { useFriendStore } from "../store/useFriendStore";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { 
  X, User, Mail, Calendar, MessageCircle, UserMinus, 
 Flag, Info, Hash, Shield, Clock, 
  UserCheck, Activity, Camera, Edit3,
  Blocks
} from "lucide-react";

const FriendProfile = ({ friend, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('info');
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  
  const { authUser, onlineUsers } = useAuthStore();
  const { removeFriend } = useFriendStore();
  const { messages, getMessages, groups } = useChatStore();

  useEffect(() => {
    if (isOpen && friend) {
      // Get message history for stats
      getMessages(friend._id, 'direct');
    }
  }, [isOpen, friend]);

  if (!isOpen || !friend) return null;

  const isOnline = onlineUsers.includes(friend._id);
  
  // Calculate chat statistics
  const totalMessages = messages.length;
  const myMessages = messages.filter(msg => msg.senderId._id === authUser._id).length;
  const theirMessages = totalMessages - myMessages;
  const mediaMessages = messages.filter(msg => msg.image).length;
  
  // Find mutual groups
  const mutualGroups = groups.filter(group => 
    group.members?.some(member => member.user._id === friend._id)
  );

  const handleRemoveFriend = async () => {
    try {
      await removeFriend(friend._id);
      setShowRemoveConfirm(false);
      onClose();
    } catch (error) {
      // Error handled in store
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-base-100 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
          
          {/* Header */}
          <div className="relative">
            {/* Background Pattern */}
            <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/5 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
            </div>
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 btn btn-ghost btn-sm btn-circle bg-base-100/80 hover:bg-base-100"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Info */}
            <div className="relative -mt-16 px-6">
              <div className="flex flex-col items-center text-center">
                {/* Avatar */}
                <div className="relative">
                  <img
                    src={friend.profilePic || "/avatar.png"}
                    alt={friend.fullName}
                    className="w-24 h-24 rounded-full object-cover border-4 border-base-100 shadow-lg"
                  />
                  {/* Online Status */}
                  <div className={`absolute -bottom-1 -right-1 w-6 h-6 border-4 border-base-100 rounded-full ${
                    isOnline ? 'bg-success' : 'bg-base-300'
                  }`}></div>
                </div>

                {/* Name & Status */}
                <h2 className="text-2xl font-bold text-base-content mt-4 mb-1">
                  {friend.fullName}
                </h2>
                <p className={`text-sm font-medium mb-2 ${
                  isOnline ? 'text-success' : 'text-base-content/70'
                }`}>
                  {isOnline ? '● Online' : 'Last seen recently'}
                </p>
                <p className="text-base-content/70 text-sm">{friend.email}</p>

                {/* Quick Actions */}
                <div className="flex gap-3 mt-4 mb-6">
                  <button className="btn btn-primary flex-1 sm:flex-none">
                    <MessageCircle className="w-4 h-4" />
                    Message
                  </button>
                  <button 
                    onClick={() => setShowRemoveConfirm(true)}
                    className="btn btn-outline btn-error flex-1 sm:flex-none"
                  >
                    <UserMinus className="w-4 h-4" />
                    Remove Friend
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-base-300">
            <div className="flex px-6">
              <button
                onClick={() => setActiveTab('info')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'info'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-base-content/70 hover:text-base-content'
                }`}
              >
                <Info className="w-4 h-4 inline mr-2" />
                Info
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'stats'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-base-content/70 hover:text-base-content'
                }`}
              >
                <Activity className="w-4 h-4 inline mr-2" />
                Chat Stats
              </button>
              <button
                onClick={() => setActiveTab('groups')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'groups'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-base-content/70 hover:text-base-content'
                }`}
              >
                <Hash className="w-4 h-4 inline mr-2" />
                Mutual Groups ({mutualGroups.length})
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-300px)]">
            
            {activeTab === 'info' && (
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-base-content flex items-center gap-2">
                                        <User className="w-5 h-5 text-primary" />
                    Basic Information
                  </h3>
                  
                  <div className="grid gap-4">
                    <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                      <Mail className="w-5 h-5 text-base-content/70" />
                      <div>
                        <p className="text-sm text-base-content/70">Email</p>
                        <p className="font-medium text-base-content">{friend.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                      <UserCheck className="w-5 h-5 text-base-content/70" />
                      <div>
                        <p className="text-sm text-base-content/70">Friend Since</p>
                        <p className="font-medium text-base-content">
                          {new Date(friend.createdAt || Date.now()).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                      <Activity className="w-5 h-5 text-base-content/70" />
                      <div>
                        <p className="text-sm text-base-content/70">Status</p>
                        <p className={`font-medium ${isOnline ? 'text-success' : 'text-base-content'}`}>
                          {isOnline ? 'Currently Online' : 'Offline'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Privacy & Safety */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-base-content flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Privacy & Safety
                  </h3>
                  
                  <div className="grid gap-3">
                    <button className="flex items-center gap-3 p-3 bg-base-200 hover:bg-base-300 rounded-lg transition-colors">
                      <Blocks className="w-5 h-5 text-warning" />
                      <div className="text-left">
                        <p className="font-medium text-base-content">Block User</p>
                        <p className="text-sm text-base-content/70">Prevent this user from contacting you</p>
                      </div>
                    </button>
                    
                    <button className="flex items-center gap-3 p-3 bg-base-200 hover:bg-base-300 rounded-lg transition-colors">
                      <Flag className="w-5 h-5 text-error" />
                      <div className="text-left">
                        <p className="font-medium text-base-content">Report User</p>
                        <p className="text-sm text-base-content/70">Report inappropriate behavior</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="space-y-6">
                {/* Chat Statistics */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-base-content flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-primary" />
                    Chat Statistics
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-primary">{totalMessages}</div>
                      <div className="text-sm text-base-content/70">Total Messages</div>
                    </div>
                    
                    <div className="bg-success/10 border border-success/20 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-success">{mediaMessages}</div>
                      <div className="text-sm text-base-content/70">Media Shared</div>
                    </div>
                    
                    <div className="bg-info/10 border border-info/20 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-info">{myMessages}</div>
                      <div className="text-sm text-base-content/70">Your Messages</div>
                    </div>
                    
                    <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-secondary">{theirMessages}</div>
                      <div className="text-sm text-base-content/70">Their Messages</div>
                    </div>
                  </div>
                </div>

                {/* Activity Timeline */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-base-content flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Recent Activity
                  </h3>
                  
                  {messages.length > 0 ? (
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {messages.slice(-5).reverse().map((message, index) => (
                        <div key={message._id} className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                          <img
                            src={message.senderId.profilePic || "/avatar.png"}
                            alt={message.senderId.fullName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm text-base-content">
                                {message.senderId._id === authUser._id ? 'You' : friend.fullName}
                              </span>
                              <span className="text-xs text-base-content/60">
                                {new Date(message.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-base-content/70 truncate">
                              {message.image ? '📷 Shared an image' : message.text}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MessageCircle className="w-12 h-12 text-base-content/30 mx-auto mb-2" />
                      <p className="text-base-content/70">No messages yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'groups' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-base-content flex items-center gap-2">
                    <Hash className="w-5 h-5 text-primary" />
                    Mutual Groups
                  </h3>
                  
                  {mutualGroups.length > 0 ? (
                    <div className="space-y-3">
                      {mutualGroups.map((group) => (
                        <div key={group._id} className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                          <img
                            src={group.groupPic || "/avatar.png"}
                            alt={group.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-base-300"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold text-base-content">{group.name}</h4>
                            <p className="text-sm text-base-content/70">
                              {group.members?.length || 0} members
                            </p>
                          </div>
                          <button className="btn btn-ghost btn-sm">
                            <MessageCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Hash className="w-12 h-12 text-base-content/30 mx-auto mb-2" />
                      <p className="text-base-content/70">No mutual groups</p>
                      <p className="text-sm text-base-content/50 mt-1">
                        Create a group together to start collaborating!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Remove Friend Confirmation Modal */}
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
                Are you sure you want to remove <span className="font-semibold">{friend.fullName}</span> from your friends list? 
                This action cannot be undone.
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
    </>
  );
};

export default FriendProfile;