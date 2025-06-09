// components/FriendSearch.jsx
import { useState, useEffect } from "react";
import { useFriendStore } from "../store/useFriendStore";
import { Search, UserPlus, Clock, Check, X } from "lucide-react";

const FriendSearch = () => {
  const [searchInput, setSearchInput] = useState("");
  const {
    searchResults,
    isSearching,
    searchQuery,
    searchUsers,
    clearSearch,
    sendFriendRequest,
    cancelFriendRequest
  } = useFriendStore();

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchInput.trim()) {
        searchUsers(searchInput);
      } else {
        clearSearch();
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchInput, searchUsers, clearSearch]);

  const handleSendRequest = async (userId) => {
    await sendFriendRequest(userId);
  };

  const handleCancelRequest = async (userId) => {
    await cancelFriendRequest(userId);
  };

  const getStatusButton = (user) => {
    switch (user.friendStatus) {
      case 'friend':
        return (
          <div className="btn btn-sm btn-success btn-disabled">
            <Check className="w-4 h-4" />
            <span className="hidden sm:inline">Friends</span>
          </div>
        );
      case 'sent':
        return (
          <button
            onClick={() => handleCancelRequest(user._id)}
            className="btn btn-sm btn-warning"
          >
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Pending</span>
          </button>
        );
      case 'received':
        return (
          <div className="btn btn-sm btn-info btn-disabled">
            <span className="hidden sm:inline">Sent you request</span>
            <span className="sm:hidden">Received</span>
          </div>
        );
      default:
        return (
          <button
            onClick={() => handleSendRequest(user._id)}
            className="btn btn-sm btn-primary"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Friend</span>
          </button>
        );
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl border border-base-300">
      <div className="card-body">
        <h2 className="card-title text-base-content mb-4 flex items-center gap-2">
          <Search className="w-5 h-5 text-primary" />
          Find Friends
        </h2>

        {/* Search Input */}
        <div className="form-control">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-base-content/50" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="input input-bordered w-full pl-10"
            />
            {searchInput && (
              <button
                onClick={() => {
                  setSearchInput("");
                  clearSearch();
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 btn btn-ghost btn-xs btn-circle"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isSearching && (
          <div className="flex items-center justify-center py-8">
            <span className="loading loading-spinner loading-md"></span>
          </div>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-3 mt-4">
            <h3 className="font-semibold text-base-content">Search Results</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {searchResults.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center gap-3 p-3 bg-base-200 rounded-lg hover:bg-base-300 transition-colors"
                >
                  {/* Avatar */}
                  <img
                    src={user.profilePic || "/avatar.png"}
                    alt={user.fullName}
                    className="w-10 h-10 rounded-full object-cover border-2 border-base-300"
                  />

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-base-content truncate">
                      {user.fullName}
                    </h4>
                    <p className="text-sm text-base-content/70 truncate">
                      {user.email}
                    </p>
                  </div>

                  {/* Action Button */}
                  {getStatusButton(user)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {searchQuery && !isSearching && searchResults.length === 0 && (
          <div className="text-center py-8">
            <Search className="w-12 h-12 text-base-content/30 mx-auto mb-2" />
            <p className="text-base-content/70">No users found for "{searchQuery}"</p>
          </div>
        )}

        {/* Search Prompt */}
        {!searchQuery && !isSearching && (
          <div className="text-center py-8">
            <UserPlus className="w-12 h-12 text-base-content/30 mx-auto mb-2" />
            <p className="text-base-content/70">Search for users to add as friends</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendSearch;