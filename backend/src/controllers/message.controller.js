import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import Group from "../models/group.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

// Update getUsersForSidebar in controllers/message.controller.js
export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    
    // Get user with populated friends
    const user = await User.findById(loggedInUserId)
      .populate('friends', '-password -friendRequests')
      .select('friends');

    // Get last message and unread count for each friend
    const friendsWithMessageInfo = await Promise.all(
      user.friends.map(async (friend) => {
        // Get last message between user and friend
        const lastMessage = await Message.findOne({
          messageType: 'direct',
          $or: [
            { senderId: loggedInUserId, receiverId: friend._id },
            { senderId: friend._id, receiverId: loggedInUserId }
          ],
          deletedAt: { $exists: false }
        })
        .sort({ createdAt: -1 })
        .populate('senderId', 'fullName')
        .lean();

        // Get unread count
        const unreadCount = await Message.countDocuments({
          senderId: friend._id,
          receiverId: loggedInUserId,
          messageType: 'direct',
          isRead: false,
          deletedAt: { $exists: false }
        });

        return {
          ...friend.toObject(),
          lastMessage,
          unreadCount
        };
      })
    );

    // Sort by last message time (most recent first)
    friendsWithMessageInfo.sort((a, b) => {
      const aTime = a.lastMessage?.createdAt || 0;
      const bTime = b.lastMessage?.createdAt || 0;
      return new Date(bTime) - new Date(aTime);
    });

    res.status(200).json(friendsWithMessageInfo);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 🔥 UPDATE: Enhanced getGroupsForSidebar with last message and unread count
export const getGroupsForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    
    const groups = await Group.find({
      'members.user': loggedInUserId
    })
    .populate('members.user', 'fullName profilePic')
    .select('name groupPic members lastActivity')
    .lean();

    // Get last message and unread count for each group
    const groupsWithMessageInfo = await Promise.all(
      groups.map(async (group) => {
        // Get last message in group
        const lastMessage = await Message.findOne({
          groupId: group._id,
          messageType: 'group',
          deletedAt: { $exists: false }
        })
        .sort({ createdAt: -1 })
        .populate('senderId', 'fullName')
        .lean();

        // Get unread count for this user
        const unreadCount = await Message.countDocuments({
          groupId: group._id,
          messageType: 'group',
          senderId: { $ne: loggedInUserId },
          'readBy.user': { $ne: loggedInUserId },
          deletedAt: { $exists: false }
        });

        return {
          ...group,
          lastMessage,
          unreadCount
        };
      })
    );

    // Sort by last activity (most recent first)
    groupsWithMessageInfo.sort((a, b) => {
      const aTime = a.lastMessage?.createdAt || a.lastActivity || 0;
      const bTime = b.lastMessage?.createdAt || b.lastActivity || 0;
      return new Date(bTime) - new Date(aTime);
    });

    res.status(200).json(groupsWithMessageInfo);
  } catch (error) {
    console.error("Error in getGroupsForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      messageType: 'direct',
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).populate('senderId', 'fullName profilePic');

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (req.file) {
      const uploadResponse = await cloudinary.uploader.upload(req.file.path);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      messageType: 'direct'
    });

    await newMessage.save();
    
    // 🔥 FIX: Populate sender info before sending
    await newMessage.populate('senderId', 'fullName profilePic');
    console.log("📤 Sending newMessage event to:", receiverId);
    console.log("📤 Message:", newMessage);

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendGroupMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const { groupId } = req.params;
    const senderId = req.user._id;

    // Verify user is a member of the group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const isMember = group.members.some(member => 
      member.user.toString() === senderId.toString()
    );

    if (!isMember) {
      return res.status(403).json({ error: "Not a member of this group" });
    }

    let imageUrl;
    if (req.file) {
      const uploadResponse = await cloudinary.uploader.upload(req.file.path);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      groupId,
      text,
      image: imageUrl,
      messageType: 'group'
    });

    await newMessage.save();
    await newMessage.populate('senderId', 'fullName profilePic');

    // Update group's last activity
    group.lastActivity = new Date();
    await group.save();

        console.log("📤 Sending newGroupMessage event to group:", groupId);
    console.log("📤 Group members:", group.members.length);

    // Send to all group members except sender
    group.members.forEach(member => {
      if (member.user.toString() !== senderId.toString()) {
        const memberSocketId = getReceiverSocketId(member.user.toString());
        if (memberSocketId) {
          io.to(memberSocketId).emit("newGroupMessage", newMessage);
        }
      }
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendGroupMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUnreadCounts = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get unread direct message counts
    const directUnreadCounts = await Message.aggregate([
      {
        $match: {
          messageType: 'direct',
          receiverId: userId,
          isRead: false,
          deletedAt: { $exists: false }
        }
      },
      {
        $group: {
          _id: '$senderId',
          unreadCount: { $sum: 1 },
          lastMessage: { $last: '$$ROOT' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
          pipeline: [{ $project: { fullName: 1, profilePic: 1 } }]
        }
      }
    ]);

    // Get unread group message counts
    const groupUnreadCounts = await Message.aggregate([
      {
        $match: {
          messageType: 'group',
          senderId: { $ne: userId },
          'readBy.user': { $ne: userId },
          deletedAt: { $exists: false }
        }
      },
      {
        $group: {
          _id: '$groupId',
          unreadCount: { $sum: 1 },
          lastMessage: { $last: '$$ROOT' }
        }
      },
      {
        $lookup: {
          from: 'groups',
          localField: '_id',
          foreignField: '_id',
          as: 'group',
          pipeline: [{ $project: { name: 1, groupPic: 1 } }]
        }
      }
    ]);

    res.status(200).json({
      direct: directUnreadCounts,
      group: groupUnreadCounts
    });
  } catch (error) {
    console.error("Error in getUnreadCounts: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 🔥 NEW: Mark direct messages as read
export const markDirectMessagesAsRead = async (req, res) => {
  try {
    const { senderId } = req.params;
    const receiverId = req.user._id;

    await Message.updateMany(
      {
        senderId: senderId,
        receiverId: receiverId,
        messageType: 'direct',
        isRead: false
      },
      {
        $set: {
          isRead: true,
          readAt: new Date()
        }
      }
    );

    // Emit socket event to sender about messages being read
    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messagesRead", {
        readBy: receiverId,
        chatType: 'direct'
      });
    }

    res.status(200).json({ message: "Messages marked as read" });
  } catch (error) {
    console.error("Error in markDirectMessagesAsRead: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 🔥 NEW: Mark group messages as read
export const markGroupMessagesAsRead = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    // Find unread messages in the group for this user
    const unreadMessages = await Message.find({
      groupId: groupId,
      messageType: 'group',
      senderId: { $ne: userId },
      'readBy.user': { $ne: userId },
      deletedAt: { $exists: false }
    });

    // Mark messages as read
    await Message.updateMany(
      {
        groupId: groupId,
        messageType: 'group',
        senderId: { $ne: userId },
        'readBy.user': { $ne: userId },
        deletedAt: { $exists: false }
      },
      {
        $push: {
          readBy: {
            user: userId,
            readAt: new Date()
          }
        }
      }
    );

    // Emit socket event to group members
    const group = await Group.findById(groupId);
    if (group) {
      group.members.forEach(member => {
        if (member.user.toString() !== userId.toString()) {
          const memberSocketId = getReceiverSocketId(member.user.toString());
          if (memberSocketId) {
            io.to(memberSocketId).emit("messagesRead", {
              readBy: userId,
              groupId: groupId,
              chatType: 'group'
            });
          }
        }
      });
    }

    res.status(200).json({ message: "Group messages marked as read" });
  } catch (error) {
    console.error("Error in markGroupMessagesAsRead: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};