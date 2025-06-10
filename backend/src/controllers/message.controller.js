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

    // Return only friends, not all users
    res.status(200).json(user.friends || []);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getGroupsForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    
    const groups = await Group.find({
      'members.user': loggedInUserId
    })
    .populate('members.user', 'fullName profilePic')
    .select('name groupPic members lastActivity')
    .sort({ lastActivity: -1 });

    res.status(200).json(groups);
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
      // Upload file to Cloudinary using file path
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

