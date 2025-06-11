// controllers/group.controller.js
import Group from "../models/group.model.js";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const createGroup = async (req, res) => {
  try {
    const { name, description, memberIds, isPrivate, allowMemberInvite } = req.body;
    const creatorId = req.user._id;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Group name is required" });
    }

    // Parse memberIds if it's a string
    let members = [];
    if (memberIds) {
      members = typeof memberIds === 'string' ? JSON.parse(memberIds) : memberIds;
    }

    // Validate members exist and are friends with creator
    if (members.length > 0) {
      const creator = await User.findById(creatorId);
      const validMembers = members.filter(memberId => 
        creator.friends.includes(memberId) || memberId === creatorId.toString()
      );

      if (validMembers.length !== members.length) {
        return res.status(400).json({ error: "Can only add friends to group" });
      }
    }

    // Handle group picture upload
    let groupPicUrl = "";
    if (req.file) {
      const uploadResponse = await cloudinary.uploader.upload(req.file.path);
      groupPicUrl = uploadResponse.secure_url;
    }

    // Create group with creator as admin
    const groupMembers = [
      { user: creatorId, role: 'admin' },
      ...members.filter(id => id !== creatorId.toString()).map(id => ({ user: id, role: 'member' }))
    ];

    const newGroup = new Group({
      name: name.trim(),
      description: description?.trim() || "",
      groupPic: groupPicUrl,
      members: groupMembers,
      createdBy: creatorId,
      settings: {
        isPrivate: isPrivate === 'true',
        allowMemberInvite: allowMemberInvite !== 'false'
      }
    });

    await newGroup.save();

    // Add group to all members' groups array
    const memberUserIds = groupMembers.map(member => member.user);
    await User.updateMany(
      { _id: { $in: memberUserIds } },
      { $push: { groups: newGroup._id } }
    );

    // Populate group data
    await newGroup.populate('members.user', 'fullName email profilePic');
    await newGroup.populate('createdBy', 'fullName email profilePic');

    // Send real-time notifications to members
    members.forEach(memberId => {
      if (memberId !== creatorId.toString()) {
        const memberSocketId = getReceiverSocketId(memberId);
        if (memberSocketId) {
          io.to(memberSocketId).emit("addedToGroup", {
            group: newGroup,
            addedBy: req.user
          });
        }
      }
    });

    res.status(201).json(newGroup);
  } catch (error) {
    console.error("Error in createGroup: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMyGroups = async (req, res) => {
  try {
    const userId = req.user._id;

    const groups = await Group.find({
      'members.user': userId
    })
    .populate('members.user', 'fullName email profilePic')
    .populate('createdBy', 'fullName email profilePic')
    .sort({ lastActivity: -1 });

    res.status(200).json(groups);
  } catch (error) {
    console.error("Error in getMyGroups: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getGroupDetails = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(groupId)
      .populate('members.user', 'fullName email profilePic')
      .populate('createdBy', 'fullName email profilePic');

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Check if user is a member
    const isMember = group.members.some(member => member.user._id.toString() === userId.toString());
    if (!isMember) {
      return res.status(403).json({ error: "Not a member of this group" });
    }

    res.status(200).json(group);
  } catch (error) {
    console.error("Error in getGroupDetails: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const addMember = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userIds } = req.body;
    const currentUserId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Check if current user is admin or if group allows member invites
    const currentMember = group.members.find(member => 
      member.user.toString() === currentUserId.toString()
    );

    if (!currentMember) {
      return res.status(403).json({ error: "Not a member of this group" });
    }

    if (currentMember.role !== 'admin' && !group.settings.allowMemberInvite) {
      return res.status(403).json({ error: "Only admins can add members" });
    }

    // Validate users and check if they're friends (for private groups)
    const usersToAdd = Array.isArray(userIds) ? userIds : [userIds];
    const existingMemberIds = group.members.map(member => member.user.toString());
    
    // Filter out users already in group
    const newUserIds = usersToAdd.filter(userId => !existingMemberIds.includes(userId));

    if (newUserIds.length === 0) {
      return res.status(400).json({ error: "All users are already members" });
    }

    // Check group member limit
    if (group.members.length + newUserIds.length > group.settings.maxMembers) {
      return res.status(400).json({ error: "Group member limit exceeded" });
    }

    // For private groups, ensure users are friends with an admin
    if (group.settings.isPrivate) {
      const currentUser = await User.findById(currentUserId);
      const validUsers = newUserIds.filter(userId => 
        currentUser.friends.includes(userId)
      );
      
      if (validUsers.length !== newUserIds.length) {
        return res.status(400).json({ error: "Can only add friends to private groups" });
      }
    }

    // Add new members
    const newMembers = newUserIds.map(userId => ({
      user: userId,
      role: 'member',
      joinedAt: new Date()
    }));

    group.members.push(...newMembers);
    group.lastActivity = new Date();
    await group.save();

    // Add group to users' groups array
    await User.updateMany(
      { _id: { $in: newUserIds } },
      { $push: { groups: groupId } }
    );

    // 🔥 FIX: Get the fully populated updated group
    const updatedGroup = await Group.findById(groupId)
      .populate('members.user', 'fullName email profilePic')
      .populate('createdBy', 'fullName email profilePic');

    // Send real-time notifications to new members
    newUserIds.forEach(userId => {
      const userSocketId = getReceiverSocketId(userId);
      if (userSocketId) {
        io.to(userSocketId).emit("addedToGroup", {
          group: updatedGroup, // 🔥 Send full group data
          addedBy: req.user
        });
      }
    });

    // 🔥 FIX: Notify ALL existing members (including the one who added)
    existingMemberIds.forEach(memberId => {
      const memberSocketId = getReceiverSocketId(memberId);
      if (memberSocketId) {
        io.to(memberSocketId).emit("groupMembersAdded", {
          group: updatedGroup, // 🔥 Send the complete updated group
          newMembers: newMembers,
          addedBy: req.user
        });
      }
    });

    res.status(200).json({ message: "Members added successfully", group: updatedGroup });
  } catch (error) {
    console.error("Error in addMember: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { groupId, userId } = req.params;
    const currentUserId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Check if current user is admin
    const currentMember = group.members.find(member => 
      member.user.toString() === currentUserId.toString()
    );

    if (!currentMember || currentMember.role !== 'admin') {
      return res.status(403).json({ error: "Only admins can remove members" });
    }

    // Can't remove the group creator
    if (userId === group.createdBy.toString()) {
      return res.status(400).json({ error: "Cannot remove group creator" });
    }

    // Remove member
    group.members = group.members.filter(member => 
      member.user.toString() !== userId
    );
    group.lastActivity = new Date();
    await group.save();

    // Remove group from user's groups array
    await User.findByIdAndUpdate(userId, {
      $pull: { groups: groupId }
    });

    // 🔥 FIX: Get the fully populated updated group
    const updatedGroup = await Group.findById(groupId)
      .populate('members.user', 'fullName email profilePic')
      .populate('createdBy', 'fullName email profilePic');

    // Send real-time notification to removed user
    const removedUserSocketId = getReceiverSocketId(userId);
    if (removedUserSocketId) {
      io.to(removedUserSocketId).emit("removedFromGroup", {
        groupId: groupId,
        groupName: group.name,
        removedBy: req.user
      });
    }

    // 🔥 FIX: Notify ALL remaining members with updated group data
    group.members.forEach(member => {
      const memberSocketId = getReceiverSocketId(member.user.toString());
      if (memberSocketId) {
        io.to(memberSocketId).emit("groupMemberRemoved", {
          group: updatedGroup, // 🔥 Send complete updated group
          removedUserId: userId,
          removedBy: req.user
        });
      }
    });

    res.status(200).json({ message: "Member removed successfully" });
  } catch (error) {
    console.error("Error in removeMember: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const leaveGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Check if user is a member
    const memberIndex = group.members.findIndex(member => 
      member.user.toString() === userId.toString()
    );

    if (memberIndex === -1) {
      return res.status(400).json({ error: "Not a member of this group" });
    }

    // If user is the creator and there are other admins, transfer ownership
    if (group.createdBy.toString() === userId.toString()) {
      const otherAdmins = group.members.filter(member => 
        member.role === 'admin' && member.user.toString() !== userId.toString()
      );

      if (otherAdmins.length > 0) {
        // Transfer ownership to first admin
        group.createdBy = otherAdmins[0].user;
      } else if (group.members.length > 1) {
        // Make first member an admin and transfer ownership
        const firstMember = group.members.find(member => 
          member.user.toString() !== userId.toString()
        );
        firstMember.role = 'admin';
        group.createdBy = firstMember.user;
      } else {
        // Last member leaving, delete the group
        await Group.findByIdAndDelete(groupId);
        await User.findByIdAndUpdate(userId, {
          $pull: { groups: groupId }
        });
        return res.status(200).json({ message: "Group deleted as you were the last member" });
      }
    }

    // Remove user from group
    group.members.splice(memberIndex, 1);
    group.lastActivity = new Date();
    await group.save();

    // Remove group from user's groups array
    await User.findByIdAndUpdate(userId, {
      $pull: { groups: groupId }
    });

    // Notify remaining members
    group.members.forEach(member => {
      const memberSocketId = getReceiverSocketId(member.user.toString());
      if (memberSocketId) {
        io.to(memberSocketId).emit("groupMemberLeft", {
          groupId: groupId,
          leftUserId: userId,
          leftUser: req.user
        });
      }
    });

    res.status(200).json({ message: "Left group successfully" });
  } catch (error) {
    console.error("Error in leaveGroup: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { page = 1, limit = 50, before = null } = req.query;
    const userId = req.user._id;

    // Check if user is a member of the group (existing code)
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const isMember = group.members.some(member => 
      member.user.toString() === userId.toString()
    );

    if (!isMember) {
      return res.status(403).json({ error: "Not a member of this group" });
    }

    console.log(`📜 Getting group messages: ${groupId}, page=${page}, limit=${limit}, before=${before}`);

    // Build query
    const query = {
      groupId: groupId,
      messageType: 'group',
      deletedAt: { $exists: false }
    };

    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    // Get total count
    const totalMessages = await Message.countDocuments({
      groupId: groupId,
      messageType: 'group',
      deletedAt: { $exists: false }
    });

    // Get messages with pagination
    const messages = await Message.find(query)
      .populate('senderId', 'fullName profilePic')
      .populate('replyTo')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    // Reverse to get chronological order
    messages.reverse();

    const hasMore = totalMessages > parseInt(page) * parseInt(limit);

    console.log(`📜 Retrieved ${messages.length} group messages, hasMore: ${hasMore}`);

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
    console.error("Error in getGroupMessages: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Continue group.controller.js

export const updateGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, description, isPrivate, allowMemberInvite, maxMembers } = req.body;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Check if user is admin
    const member = group.members.find(member => 
      member.user.toString() === userId.toString()
    );

    if (!member || member.role !== 'admin') {
      return res.status(403).json({ error: "Only admins can update group" });
    }

    // Handle group picture upload
    let groupPicUrl = group.groupPic;
    if (req.file) {
      const uploadResponse = await cloudinary.uploader.upload(req.file.path);
      groupPicUrl = uploadResponse.secure_url;
    }

    // Update group
    const updateData = {
      lastActivity: new Date()
    };

    if (name && name.trim()) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (groupPicUrl) updateData.groupPic = groupPicUrl;
    
    if (isPrivate !== undefined) updateData['settings.isPrivate'] = isPrivate === 'true';
    if (allowMemberInvite !== undefined) updateData['settings.allowMemberInvite'] = allowMemberInvite !== 'false';
    if (maxMembers && maxMembers > 0) updateData['settings.maxMembers'] = Math.min(maxMembers, 500);

    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      updateData,
      { new: true }
    )
    .populate('members.user', 'fullName email profilePic')
    .populate('createdBy', 'fullName email profilePic'); // 🔥 ADD THIS

    // 🔥 FIX: Notify ALL members about group update (including sender)
    group.members.forEach(member => {
      const memberSocketId = getReceiverSocketId(member.user.toString());
      if (memberSocketId) {
        io.to(memberSocketId).emit("groupUpdated", {
          group: updatedGroup, // 🔥 Send the fully populated group
          updatedBy: req.user
        });
      }
    });

    res.status(200).json(updatedGroup);
  } catch (error) {
    console.error("Error in updateGroup: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Only group creator can delete
    if (group.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Only group creator can delete group" });
    }

    // Get all member IDs before deletion
    const memberIds = group.members.map(member => member.user);

    // Delete all group messages
    await Message.deleteMany({ groupId: groupId });

    // Remove group from all members' groups array
    await User.updateMany(
      { _id: { $in: memberIds } },
      { $pull: { groups: groupId } }
    );

    // Delete the group
    await Group.findByIdAndDelete(groupId);

    // Notify all members
    memberIds.forEach(memberId => {
      if (memberId.toString() !== userId.toString()) {
        const memberSocketId = getReceiverSocketId(memberId.toString());
        if (memberSocketId) {
          io.to(memberSocketId).emit("groupDeleted", {
            groupId: groupId,
            groupName: group.name,
            deletedBy: req.user
          });
        }
      }
    });

    res.status(200).json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error("Error in deleteGroup: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateMemberRole = async (req, res) => {
  try {
    const { groupId, userId } = req.params;
    const { role } = req.body;
    const currentUserId = req.user._id;

    if (!['admin', 'member'].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Check if current user is admin
    const currentMember = group.members.find(member => 
      member.user.toString() === currentUserId.toString()
    );

    if (!currentMember || currentMember.role !== 'admin') {
      return res.status(403).json({ error: "Only admins can change member roles" });
    }

    // Find target member
    const targetMember = group.members.find(member => 
      member.user.toString() === userId
    );

    if (!targetMember) {
      return res.status(404).json({ error: "User is not a member of this group" });
    }

    // Can't change creator's role
    if (userId === group.createdBy.toString()) {
      return res.status(400).json({ error: "Cannot change group creator's role" });
    }

    // Update role
    targetMember.role = role;
    group.lastActivity = new Date();
    await group.save();

    // Notify the user whose role was changed
    const targetSocketId = getReceiverSocketId(userId);
    if (targetSocketId) {
      io.to(targetSocketId).emit("groupRoleChanged", {
        groupId: groupId,
        newRole: role,
        changedBy: req.user
      });
    }

    // Notify other members
    group.members.forEach(member => {
      if (member.user.toString() !== currentUserId.toString() && member.user.toString() !== userId) {
        const memberSocketId = getReceiverSocketId(member.user.toString());
        if (memberSocketId) {
          io.to(memberSocketId).emit("groupMemberRoleChanged", {
            groupId: groupId,
            userId: userId,
            newRole: role,
            changedBy: req.user
          });
        }
      }
    });

    res.status(200).json({ message: "Member role updated successfully" });
  } catch (error) {
    console.error("Error in updateMemberRole: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const searchGroups = async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.user._id;

    if (!query || query.trim() === "") {
      return res.status(400).json({ error: "Search query is required" });
    }

    // Search only public groups that user is not already a member of
    const groups = await Group.find({
      $and: [
        { 'settings.isPrivate': false },
        { 'members.user': { $ne: userId } },
        {
          $or: [
            { name: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
          ]
        }
      ]
    })
    .populate('createdBy', 'fullName profilePic')
    .select('name description groupPic members createdBy settings createdAt')
    .limit(20);

    // Add member count to each group
    const groupsWithCount = groups.map(group => ({
      ...group.toObject(),
      memberCount: group.members.length
    }));

    res.status(200).json(groupsWithCount);
  } catch (error) {
    console.error("Error in searchGroups: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getGroupMessagesBefore = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { before, limit = 50 } = req.query;
    const userId = req.user._id;

    if (!before) {
      return res.status(400).json({ error: "Before timestamp is required" });
    }

    // Check if user is a member of the group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const isMember = group.members.some(member => 
      member.user.toString() === userId.toString()
    );

    if (!isMember) {
      return res.status(403).json({ error: "Not a member of this group" });
    }

    console.log(`📜 Getting group messages before: ${before} for group: ${groupId}`);

    const messages = await Message.find({
      groupId: groupId,
      messageType: 'group',
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

    console.log(`📜 Retrieved ${messages.length} group messages before ${before}, hasMore: ${hasMore}`);

    res.status(200).json({
      messages,
      hasMore
    });
  } catch (error) {
    console.error("Error in getGroupMessagesBefore: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};