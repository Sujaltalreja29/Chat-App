// controllers/friend.controller.js
import User from "../models/user.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const currentUserId = req.user._id;

    if (!query || query.trim() === "") {
      return res.status(400).json({ error: "Search query is required" });
    }

    // Find users matching the search query (excluding current user)
    const users = await User.find({
      $and: [
        { _id: { $ne: currentUserId } },
        {
          $or: [
            { fullName: { $regex: query, $options: "i" } },
            { email: { $regex: query, $options: "i" } }
          ]
        }
      ]
    }).select("-password -friendRequests");

    // Get current user to check friend status
    const currentUser = await User.findById(currentUserId);

    // Add friend status to each user
    const usersWithStatus = users.map(user => {
      const isFriend = currentUser.friends.includes(user._id);
      const sentRequest = currentUser.friendRequests.sent.some(req => req.to.toString() === user._id.toString());
      const receivedRequest = currentUser.friendRequests.received.some(req => req.from.toString() === user._id.toString());

      let status = 'none';
      if (isFriend) status = 'friend';
      else if (sentRequest) status = 'sent';
      else if (receivedRequest) status = 'received';

      return {
        ...user.toObject(),
        friendStatus: status
      };
    });

    res.status(200).json(usersWithStatus);
  } catch (error) {
    console.error("Error in searchUsers: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendFriendRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    if (userId === currentUserId.toString()) {
      return res.status(400).json({ error: "Cannot send friend request to yourself" });
    }

    const [currentUser, targetUser] = await Promise.all([
      User.findById(currentUserId),
      User.findById(userId)
    ]);

    if (!targetUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if already friends
    if (currentUser.friends.includes(userId)) {
      return res.status(400).json({ error: "Already friends with this user" });
    }

    // Check if request already sent
    const alreadySent = currentUser.friendRequests.sent.some(req => req.to.toString() === userId);
    if (alreadySent) {
      return res.status(400).json({ error: "Friend request already sent" });
    }

    // Check if request already received from this user
    const alreadyReceived = currentUser.friendRequests.received.some(req => req.from.toString() === userId);
    if (alreadyReceived) {
      return res.status(400).json({ error: "This user has already sent you a friend request" });
    }

    // Add to sender's sent requests
    currentUser.friendRequests.sent.push({ to: userId });
    await currentUser.save();

    // Add to receiver's received requests
    targetUser.friendRequests.received.push({ from: currentUserId });
    await targetUser.save();

    // Send real-time notification
    const receiverSocketId = getReceiverSocketId(userId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("friendRequestReceived", {
        from: {
          _id: currentUser._id,
          fullName: currentUser.fullName,
          profilePic: currentUser.profilePic
        }
      });
    }

    res.status(200).json({ message: "Friend request sent successfully" });
  } catch (error) {
    console.error("Error in sendFriendRequest: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params; // This will be the user ID who sent the request
    const currentUserId = req.user._id;

    const [currentUser, senderUser] = await Promise.all([
      User.findById(currentUserId),
      User.findById(requestId)
    ]);

    if (!senderUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if request exists
    const requestIndex = currentUser.friendRequests.received.findIndex(
      req => req.from.toString() === requestId
    );

    if (requestIndex === -1) {
      return res.status(400).json({ error: "Friend request not found" });
    }

    // Remove from received requests
    currentUser.friendRequests.received.splice(requestIndex, 1);
    
    // Remove from sender's sent requests
    const sentRequestIndex = senderUser.friendRequests.sent.findIndex(
      req => req.to.toString() === currentUserId.toString()
    );
    if (sentRequestIndex !== -1) {
      senderUser.friendRequests.sent.splice(sentRequestIndex, 1);
    }

    // Add to friends list
    currentUser.friends.push(requestId);
    senderUser.friends.push(currentUserId);

    await Promise.all([currentUser.save(), senderUser.save()]);

    // Send real-time notification
    const senderSocketId = getReceiverSocketId(requestId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("friendRequestAccepted", {
        by: {
          _id: currentUser._id,
          fullName: currentUser.fullName,
          profilePic: currentUser.profilePic
        }
      });
    }

    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.error("Error in acceptFriendRequest: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const declineFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const currentUserId = req.user._id;

    const [currentUser, senderUser] = await Promise.all([
      User.findById(currentUserId),
      User.findById(requestId)
    ]);

    if (!senderUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Remove from received requests
    const requestIndex = currentUser.friendRequests.received.findIndex(
      req => req.from.toString() === requestId
    );

    if (requestIndex === -1) {
      return res.status(400).json({ error: "Friend request not found" });
    }

    currentUser.friendRequests.received.splice(requestIndex, 1);

    // Remove from sender's sent requests
    const sentRequestIndex = senderUser.friendRequests.sent.findIndex(
      req => req.to.toString() === currentUserId.toString()
    );
    if (sentRequestIndex !== -1) {
      senderUser.friendRequests.sent.splice(sentRequestIndex, 1);
    }

    await Promise.all([currentUser.save(), senderUser.save()]);

    res.status(200).json({ message: "Friend request declined" });
  } catch (error) {
    console.error("Error in declineFriendRequest: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const cancelFriendRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const [currentUser, targetUser] = await Promise.all([
      User.findById(currentUserId),
      User.findById(userId)
    ]);

    if (!targetUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Remove from sent requests
    const sentRequestIndex = currentUser.friendRequests.sent.findIndex(
      req => req.to.toString() === userId
    );

    if (sentRequestIndex === -1) {
      return res.status(400).json({ error: "Friend request not found" });
    }

    currentUser.friendRequests.sent.splice(sentRequestIndex, 1);

    // Remove from target's received requests
    const receivedRequestIndex = targetUser.friendRequests.received.findIndex(
      req => req.from.toString() === currentUserId.toString()
    );
    if (receivedRequestIndex !== -1) {
      targetUser.friendRequests.received.splice(receivedRequestIndex, 1);
    }

    await Promise.all([currentUser.save(), targetUser.save()]);

    res.status(200).json({ message: "Friend request cancelled" });
  } catch (error) {
    console.error("Error in cancelFriendRequest: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getFriends = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    
    const user = await User.findById(currentUserId)
      .populate('friends', '-password -friendRequests')
      .select('friends');

    res.status(200).json(user.friends || []);
  } catch (error) {
    console.error("Error in getFriends: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getPendingRequests = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    
    const user = await User.findById(currentUserId)
      .populate('friendRequests.received.from', '-password -friendRequests')
      .populate('friendRequests.sent.to', '-password -friendRequests')
      .select('friendRequests');

    res.status(200).json({
      received: user.friendRequests.received || [],
      sent: user.friendRequests.sent || []
    });
  } catch (error) {
    console.error("Error in getPendingRequests: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const removeFriend = async (req, res) => {
  try {
    const { friendId } = req.params;
    const currentUserId = req.user._id;

    const [currentUser, friendUser] = await Promise.all([
      User.findById(currentUserId),
      User.findById(friendId)
    ]);

    if (!friendUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Remove from both users' friends lists
    currentUser.friends = currentUser.friends.filter(id => id.toString() !== friendId);
    friendUser.friends = friendUser.friends.filter(id => id.toString() !== currentUserId.toString());

    await Promise.all([currentUser.save(), friendUser.save()]);

    res.status(200).json({ message: "Friend removed successfully" });
  } catch (error) {
    console.error("Error in removeFriend: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};