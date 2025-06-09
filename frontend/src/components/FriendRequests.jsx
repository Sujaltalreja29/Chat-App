// components/FriendRequests.jsx
import { useEffect } from "react";
import { useFriendStore } from "../store/useFriendStore";
import { Check, X, Clock, Users } from "lucide-react";

const FriendRequests = () => {
  const {
    pendingRequests,
    isRequestsLoading,
    getPendingRequests,
    acceptFriendRequest,
    declineFriendRequest,
    cancelFriendRequest
  } = useFriendStore();

  useEffect(() => {
    getPendingRequests();
  }, [getPendingRequests]);

  const handleAccept = async (userId) => {
    await acceptFriendRequest(userId);
  };

  const handleDecline = async (userId) => {
    await declineFriendRequest(userId);
  };

  const handleCancel = async (userId) => {
    await cancelFriendRequest(userId);
  };

  if (isRequestsLoading) {
    return (
      <div className="card bg-base-100 shadow-xl border border-base-300">
        <div className="card-body">
          <div className="flex items-center justify-center py-8">
            <span className="loading loading-spinner loading-md"></span>
          </div>
        </div>
      </div>
    );
  }

  const hasRequests = pendingRequests.received.length > 0 || pendingRequests.sent.length > 0;

  return (
    <div className="card bg-base-100 shadow-xl border border-base-300">
      <div className="card-body">
        <h2 className="card-title text-base-content mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Friend Requests
          {hasRequests && (
            <div className="badge badge-primary">
              {pendingRequests.received.length + pendingRequests.sent.length}
            </div>
          )}
        </h2>

        {!hasRequests ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-base-content/30 mx-auto mb-2" />
            <p className="text-base-content/70">No pending friend requests</p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Received Requests */}
            {pendingRequests.received.length > 0 && (
              <div>
                <h3 className="font-semibold text-base-content mb-3 flex items-center gap-2">
                  Received ({pendingRequests.received.length})
                </h3>
                <div className="space-y-2">
                  {pendingRequests.received.map((request) => (
                    <div
                      key={request.from._id}
                      className="flex items-center gap-3 p-3 bg-base-200 rounded-lg"
                    >
                      {/* Avatar */}
                      <img
                        src={request.from.profilePic || "/avatar.png"}
                        alt={request.from.fullName}
                        className="w-10 h-10 rounded-full object-cover border-2 border-base-300"
                      />

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-base-content truncate">
                          {request.from.fullName}
                        </h4>
                        <p className="text-xs text-base-content/70">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAccept(request.from._id)}
                          className="btn btn-success btn-sm"
                          title="Accept"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDecline(request.from._id)}
                          className="btn btn-error btn-sm"
                          title="Decline"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sent Requests */}
            {pendingRequests.sent.length > 0 && (
              <div>
                <h3 className="font-semibold text-base-content mb-3 flex items-center gap-2">
                  Sent ({pendingRequests.sent.length})
                </h3>
                <div className="space-y-2">
                  {pendingRequests.sent.map((request) => (
                    <div
                      key={request.to._id}
                      className="flex items-center gap-3 p-3 bg-base-200 rounded-lg"
                    >
                      {/* Avatar */}
                      <img
                        src={request.to.profilePic || "/avatar.png"}
                        alt={request.to.fullName}
                        className="w-10 h-10 rounded-full object-cover border-2 border-base-300"
                      />

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-base-content truncate">
                          {request.to.fullName}
                        </h4>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-warning" />
                          <p className="text-xs text-base-content/70">
                            Pending since {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Cancel Button */}
                      <button
                        onClick={() => handleCancel(request.to._id)}
                        className="btn btn-warning btn-sm"
                        title="Cancel Request"
                      >
                        <X className="w-4 h-4" />
                        <span className="hidden sm:inline">Cancel</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendRequests;