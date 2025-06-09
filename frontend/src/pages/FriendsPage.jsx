// pages/FriendsPage.jsx
import { useEffect } from "react";
import { useFriendStore } from "../store/useFriendStore";
import FriendSearch from "../components/FriendSearch";
import FriendRequests from "../components/FriendRequests";
import { Users, UserMinus, MessageCircle, MoreVertical } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useNavigate } from "react-router-dom";

const FriendsPage = () => {
  const navigate = useNavigate();
  const {
    friends,
    isFriendsLoading,
    getFriends,
    removeFriend,
    subscribeToFriendRequests,
    unsubscribeFromFriendRequests
  } = useFriendStore();
  
  const { setSelectedUser } = useChatStore();

  useEffect(() => {
    getFriends();
    subscribeToFriendRequests();
    
    return () => {
      unsubscribeFromFriendRequests();
    };
  }, [getFriends, subscribeToFriendRequests, unsubscribeFromFriendRequests]);

  const handleStartChat = (friend) => {
    setSelectedUser(friend);
    navigate('/');
  };

  const handleRemoveFriend = async (friendId) => {
    if (window.confirm('Are you sure you want to remove this friend?')) {
      await removeFriend(friendId);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 pt-16">
      <div className="max-w-6xl mx-auto p-4 py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-base-content mb-2 flex items-center justify-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            Friends
          </h1>
          <p className="text-base-content/70">
            Manage your friends and discover new connections
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          
          {/* Left Column - Friend Search & Requests */}
          <div className="space-y-6">
            <FriendSearch />
            <FriendRequests />
          </div>

          {/* Right Column - Friends List */}
          <div className="lg:col-span-2">
            <div className="card bg-base-100 shadow-xl border border-base-300">
              <div className="card-body">
                <h2 className="card-title text-base-content mb-4 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    My Friends
                    {friends.length > 0 && (
                      <div className="badge badge-primary">{friends.length}</div>
                    )}
                  </span>
                </h2>

                {isFriendsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <span className="loading loading-spinner loading-lg"></span>
                  </div>
                ) : friends.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-base-content/30 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-base-content mb-2">
                      No friends yet
                    </h3>
                    <p className="text-base-content/70 mb-4">
                      Search for users and send friend requests to start building your network!
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {friends.map((friend) => (
                      <div
                        key={friend._id}
                        className="card bg-base-200 border border-base-300 hover:shadow-md transition-shadow"
                      >
                        <div className="card-body p-4">
                          {/* Friend Avatar & Info */}
                          <div className="flex items-center gap-3 mb-3">
                            <img
                              src={friend.profilePic || "/avatar.png"}
                              alt={friend.fullName}
                              className="w-12 h-12 rounded-full object-cover border-2 border-base-300"
                            />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-base-content truncate">
                                {friend.fullName}
                              </h3>
                              <p className="text-sm text-base-content/70 truncate">
                                {friend.email}
                              </p>
                            </div>

                            {/* Dropdown Menu */}
                            <div className="dropdown dropdown-end">
                              <button className="btn btn-ghost btn-sm btn-circle">
                                <MoreVertical className="w-4 h-4" />
                              </button>
                              <ul className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 border border-base-300">
                                <li>
                                  <button
                                    onClick={() => handleStartChat(friend)}
                                    className="flex items-center gap-2"
                                  >
                                    <MessageCircle className="w-4 h-4" />
                                    Start Chat
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => handleRemoveFriend(friend._id)}
                                    className="flex items-center gap-2 text-error hover:bg-error hover:text-error-content"
                                  >
                                    <UserMinus className="w-4 h-4" />
                                    Remove Friend
                                  </button>
                                </li>
                              </ul>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleStartChat(friend)}
                              className="btn btn-primary btn-sm flex-1"
                            >
                              <MessageCircle className="w-4 h-4" />
                              <span className="hidden sm:inline">Chat</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendsPage;