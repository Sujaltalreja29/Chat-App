// pages/FriendsPage.jsx - Enhanced UI
import { useEffect } from "react";
import { useFriendStore } from "../store/useFriendStore";
import FriendSearch from "../components/FriendSearch";
import FriendRequests from "../components/FriendRequests";
import { Users, MessageCircle, MoreVertical } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useNavigate } from "react-router-dom";

const FriendsPage = () => {
  const navigate = useNavigate();
  const { friends, isFriendsLoading, getFriends, removeFriend } = useFriendStore();
  const { setSelectedUser } = useChatStore();

  useEffect(() => {
    getFriends();
  }, [getFriends]);

  const handleStartChat = (friend) => {
    setSelectedUser(friend);
    navigate('/');
  };

  const handleRemoveFriend = async (friendId) => {
    if (window.confirm('Remove this friend?')) {
      await removeFriend(friendId);
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        
        {/* Compact Header */}
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center justify-center gap-2">
            <Users className="w-6 h-6 md:w-8 md:h-8 text-primary" />
            Friends
          </h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          
          {/* Search & Requests */}
          <div className="space-y-4">
            <FriendSearch />
            <FriendRequests />
          </div>

          {/* Friends List */}
          <div className="lg:col-span-2">
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    My Friends
                    {friends.length > 0 && (
                      <span className="badge badge-primary badge-sm">{friends.length}</span>
                    )}
                  </h2>
                </div>

                {isFriendsLoading ? (
                  <div className="flex justify-center py-8">
                    <span className="loading loading-spinner loading-lg"></span>
                  </div>
                ) : friends.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-base-content/30 mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">No friends yet</h3>
                    <p className="text-sm text-base-content/70">
                      Search for users to start building your network
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {friends.map((friend) => (
                      <div key={friend._id} className="card bg-base-200 hover:bg-base-300 transition-colors">
                        <div className="card-body p-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={friend.profilePic || "/avatar.png"}
                              alt={friend.fullName}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium truncate">{friend.fullName}</h3>
                              <p className="text-xs text-base-content/70 truncate">{friend.email}</p>
                            </div>

                            <div className="dropdown dropdown-end">
                              <button className="btn btn-ghost btn-sm btn-circle">
                                <MoreVertical className="w-4 h-4" />
                              </button>
                              <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-48">
                                <li>
                                  <button onClick={() => handleStartChat(friend)}>
                                    <MessageCircle className="w-4 h-4" />
                                    Start Chat
                                  </button>
                                </li>
                                <li>
                                  <button 
                                    onClick={() => handleRemoveFriend(friend._id)}
                                    className="text-error"
                                  >
                                    Remove Friend
                                  </button>
                                </li>
                              </ul>
                            </div>
                          </div>

                          <button
                            onClick={() => handleStartChat(friend)}
                            className="btn btn-primary btn-sm w-full mt-2"
                          >
                            <MessageCircle className="w-4 h-4" />
                            Chat
                          </button>
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