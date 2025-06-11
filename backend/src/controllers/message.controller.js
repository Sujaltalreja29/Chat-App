import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import Group from "../models/group.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import { getFileType, formatFileSize } from "../middleware/fileUpload.middleware.js";
import fs from "fs";
import path from "path";

const safeFileCleanup = async (filePath, maxRetries = 3) => {
  if (!filePath || !fs.existsSync(filePath)) return;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      fs.unlinkSync(filePath);
      console.log('🗑️ Temp file cleaned up successfully');
      return;
    } catch (error) {
      if (error.code === 'EPERM' && i < maxRetries - 1) {
        console.log(`⏳ File locked, retrying cleanup in ${(i + 1) * 100}ms...`);
        await new Promise(resolve => setTimeout(resolve, (i + 1) * 100));
      } else {
        console.warn('⚠️ Could not delete temp file:', error.message);
        // Don't throw error, just log it
        return;
      }
    }
  }
};

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
    const { page = 1, limit = 50, before = null } = req.query;
    const myId = req.user._id;

    console.log(`📜 Getting messages for direct chat: ${myId} <-> ${userToChatId}`);
    console.log(`📜 Pagination: page=${page}, limit=${limit}, before=${before}`);

    // Build query
    const query = {
      messageType: 'direct',
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
      deletedAt: { $exists: false }
    };

    // If 'before' timestamp is provided, get messages before that time
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    // Get total count for pagination info
    const totalMessages = await Message.countDocuments({
      messageType: 'direct',
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
      deletedAt: { $exists: false }
    });

    // Get messages with pagination
    const messages = await Message.find(query)
      .populate('senderId', 'fullName profilePic')
      .populate('replyTo')
      .sort({ createdAt: -1 }) // Latest first for pagination
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    // Reverse to get chronological order (oldest first)
    messages.reverse();

    const hasMore = totalMessages > parseInt(page) * parseInt(limit);

    console.log(`📜 Retrieved ${messages.length} messages, hasMore: ${hasMore}`);

    res.status(200).json({
      messages,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalMessages / parseInt(limit)),
        totalMessages,
        hasMore,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessagesBefore = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const { before, limit = 50 } = req.query;
    const myId = req.user._id;

    if (!before) {
      return res.status(400).json({ error: "Before timestamp is required" });
    }

    console.log(`📜 Getting messages before: ${before} for chat: ${myId} <-> ${userToChatId}`);

    const messages = await Message.find({
      messageType: 'direct',
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
      createdAt: { $lt: new Date(before) },
      deletedAt: { $exists: false }
    })
    .populate('senderId', 'fullName profilePic')
    .populate('replyTo')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .lean();

    // Reverse to get chronological order
    messages.reverse();

    const hasMore = messages.length === parseInt(limit);

    console.log(`📜 Retrieved ${messages.length} messages before ${before}, hasMore: ${hasMore}`);

    res.status(200).json({
      messages,
      hasMore
    });
  } catch (error) {
    console.log("Error in getMessagesBefore controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    console.log('📥 sendMessage called');
    console.log('📥 Request body:', req.body);
    console.log('📥 Request file:', req.file ? {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      filename: req.file.filename
    } : 'No file');

    const { text } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let fileData = null;
    let imageUrl = null; // Keep for backward compatibility

    if (req.file) {
      console.log('📁 Processing file upload...');
      const fileType = getFileType(req.file.mimetype);
      console.log('📁 File type detected:', fileType);
      
      try {
        // Upload to Cloudinary
        const uploadOptions = {
          resource_type: "auto",
          folder: `chat-files/${fileType}s`,
          public_id: `${Date.now()}-${path.parse(req.file.originalname).name}`,
        };

        // Special handling for images
        if (fileType === 'image') {
          uploadOptions.transformation = [
            { quality: "auto:good" },
            { fetch_format: "auto" }
          ];
        }

        console.log('☁️ Uploading to Cloudinary...');
        const uploadResponse = await cloudinary.uploader.upload(req.file.path, uploadOptions);
        console.log('☁️ Cloudinary upload successful:', uploadResponse.public_id);

        // Generate thumbnail for images
        let thumbnailUrl = null;
        if (fileType === 'image') {
          thumbnailUrl = cloudinary.url(uploadResponse.public_id, {
            width: 300,
            height: 300,
            crop: "fill",
            quality: "auto:low"
          });
        }

        // Create file data object
        fileData = {
          originalName: req.file.originalname,
          fileName: req.file.filename,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          url: uploadResponse.secure_url,
          thumbnail: thumbnailUrl,
          fileType: fileType,
          isCompressed: req.file.isCompressed || false,
          compressionRatio: req.file.compressionRatio || 0,
          dimensions: req.file.dimensions
        };

        // For backward compatibility with existing image field
        if (fileType === 'image') {
          imageUrl = uploadResponse.secure_url;
        }

        console.log(`📁 File processed successfully:`, {
          name: fileData.originalName,
          size: formatFileSize(fileData.fileSize),
          type: fileData.fileType,
          compressed: fileData.isCompressed
        });

      } catch (uploadError) {
        console.error('❌ File upload error:', uploadError);
        return res.status(500).json({ error: "Failed to upload file" });
      } finally {
        await safeFileCleanup(req.file.path);
      }
    }

    console.log('💾 Creating message document...');
    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl, // Keep for backward compatibility
      file: fileData,
      messageSubType: fileData ? fileData.fileType : 'text',
      messageType: 'direct'
    });

    console.log('💾 Message data to save:', {
      senderId,
      receiverId,
      text: text || 'No text',
      hasFile: !!fileData,
      messageSubType: fileData ? fileData.fileType : 'text'
    });

    await newMessage.save();
    console.log('✅ Message saved to database');
    
    await newMessage.populate('senderId', 'fullName profilePic');
    console.log('✅ Message populated with sender info');

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
      console.log('📡 Message sent via socket to receiver');
    } else {
      console.log('📡 Receiver not online, message saved for later');
    }

    console.log('🎉 sendMessage completed successfully');
    res.status(201).json(newMessage);
  } catch (error) {
    console.error("❌ Error in sendMessage controller:", error);
    console.error("❌ Error stack:", error.stack);
    
    // Clean up temp file on error
     if (req.file) {
      await safeFileCleanup(req.file.path);
    }
    
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

    let fileData = null;
    let imageUrl = null;

    if (req.file) {
      const fileType = getFileType(req.file.mimetype);
      
      try {
        const uploadOptions = {
          resource_type: "auto",
          folder: `chat-files/${fileType}s`,
          public_id: `${Date.now()}-${path.parse(req.file.originalname).name}`,
        };

        if (fileType === 'image') {
          uploadOptions.transformation = [
            { quality: "auto:good" },
            { fetch_format: "auto" }
          ];
        }

        const uploadResponse = await cloudinary.uploader.upload(req.file.path, uploadOptions);

        let thumbnailUrl = null;
        if (fileType === 'image') {
          thumbnailUrl = cloudinary.url(uploadResponse.public_id, {
            width: 300,
            height: 300,
            crop: "fill",
            quality: "auto:low"
          });
        }

        fileData = {
          originalName: req.file.originalname,
          fileName: req.file.filename,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          url: uploadResponse.secure_url,
          thumbnail: thumbnailUrl,
          fileType: fileType,
          isCompressed: req.file.isCompressed || false,
          compressionRatio: req.file.compressionRatio || 0,
          dimensions: req.file.dimensions
        };

        if (fileType === 'image') {
          imageUrl = uploadResponse.secure_url;
        }

      } catch (uploadError) {
        console.error('File upload error:', uploadError);
        return res.status(500).json({ error: "Failed to upload file" });
      } finally {
        await safeFileCleanup(req.file.path);
      }
    }

    const newMessage = new Message({
      senderId,
      groupId,
      text,
      image: imageUrl,
      file: fileData,
      messageSubType: fileData ? fileData.fileType : 'text',
      messageType: 'group'
    });

    await newMessage.save();
    await newMessage.populate('senderId', 'fullName profilePic');

    // Update group's last activity
    group.lastActivity = new Date();
    await group.save();

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
    
    if (req.file) {
      await safeFileCleanup(req.file.path);
    }
    
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

