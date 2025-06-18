// controllers/search.controller.js
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import Group from "../models/group.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

// 🔍 Search messages across all conversations
export const searchGlobalMessages = async (req, res) => {
  try {
    const { q: query, type = 'all', limit = 20, page = 1 } = req.query;
    const userId = req.user._id;

    console.log(`🔍 Global search request: query="${query}", user=${userId}, type=${type}`);

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: "Search query is required" });
    }

    if (query.trim().length < 2) {
      return res.status(400).json({ error: "Search query must be at least 2 characters" });
    }

    // Create case-insensitive regex for partial matching
    const searchRegex = new RegExp(query.trim(), 'i');
    
    console.log(`🔍 Search regex: ${searchRegex}`);

    // Get user's groups first
    const userGroups = await Group.find({
      'members.user': userId
    }).select('_id');
    const userGroupIds = userGroups.map(g => g._id);
    
    console.log(`👥 User groups: ${userGroupIds.length} groups`);

    // Build the search query
    const searchConditions = {
      $and: [
        // Search in text or file name
        {
          $or: [
            { text: { $regex: searchRegex } },
            { "file.originalName": { $regex: searchRegex } }
          ]
        },
        // User has access to these messages
        {
          $or: [
            // Direct messages where user is sender or receiver
            {
              messageType: 'direct',
              $or: [
                { senderId: userId },
                { receiverId: userId }
              ]
            },
            // Group messages where user is a member
            {
              messageType: 'group',
              groupId: { $in: userGroupIds }
            }
          ]
        },
        // Message is not deleted
        { deletedAt: { $exists: false } }
      ]
    };

    // Add message type filter if specified
    if (type !== 'all' && ['text', 'image', 'document', 'audio', 'video', 'voice'].includes(type)) {
      searchConditions.$and.push({ messageSubType: type });
    }

    console.log(`🔍 Search conditions:`, JSON.stringify(searchConditions, null, 2));

    // Execute the search
    const messages = await Message.find(searchConditions)
      .populate('senderId', 'fullName profilePic')
      .populate('receiverId', 'fullName profilePic')
      .populate('groupId', 'name groupPic')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    console.log(`🔍 Found ${messages.length} messages`);

    // Get total count
    const totalResults = await Message.countDocuments(searchConditions);
    
    console.log(`🔍 Total results: ${totalResults}`);

    res.status(200).json({
      messages,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalResults / limit),
        totalResults,
        hasMore: totalResults > page * limit,
        limit: parseInt(limit)
      },
      query: query.trim()
    });

  } catch (error) {
    console.error("❌ Error in searchGlobalMessages:", error);
    res.status(500).json({ error: "Search failed", details: error.message });
  }
};


// 🔍 Search within specific conversation
export const searchInConversation = async (req, res) => {
  try {
    const { id: chatId } = req.params;
    const { q: query, type = 'all', limit = 50, chatType = 'direct' } = req.query;
    const userId = req.user._id;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: "Search query is required" });
    }

    console.log(`🔍 Search in ${chatType} chat ${chatId}: "${query}"`);

    // 🔧 FIX: Use regex for partial matching
    const searchRegex = new RegExp(query.trim(), 'i');
    
    const searchConditions = {
      $or: [
        { text: { $regex: searchRegex } },
        { "file.originalName": { $regex: searchRegex } }
      ],
      deletedAt: { $exists: false }
    };

    // Add message type filter
    if (type !== 'all') {
      searchConditions.messageSubType = type;
    }

    // Add chat-specific conditions
    if (chatType === 'direct') {
      searchConditions.messageType = 'direct';
      searchConditions.$or.push(
        { senderId: userId, receiverId: chatId },
        { senderId: chatId, receiverId: userId }
      );
      // Reset $or to include both search and chat conditions
      searchConditions.$and = [
        {
          $or: [
            { text: { $regex: searchRegex } },
            { "file.originalName": { $regex: searchRegex } }
          ]
        },
        {
          $or: [
            { senderId: userId, receiverId: chatId },
            { senderId: chatId, receiverId: userId }
          ]
        }
      ];
      delete searchConditions.$or;
    } else if (chatType === 'group') {
      // Verify user is group member
      const group = await Group.findById(chatId);
      if (!group) {
        return res.status(404).json({ error: "Group not found" });
      }

      const isMember = group.members.some(member => 
        member.user.toString() === userId.toString()
      );

      if (!isMember) {
        return res.status(403).json({ error: "Not a member of this group" });
      }

      searchConditions.messageType = 'group';
      searchConditions.groupId = chatId;
    }

    const messages = await Message.find(searchConditions)
      .populate('senderId', 'fullName profilePic')
      .populate('receiverId', 'fullName profilePic')
      .populate('groupId', 'name groupPic')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    console.log(`🔍 Found ${messages.length} messages in ${chatType} chat`);

    res.status(200).json({
      messages,
      chatId,
      chatType,
      query: query.trim(),
      totalResults: messages.length
    });

  } catch (error) {
    console.error("Error in searchInConversation:", error);
    res.status(500).json({ error: "Search failed" });
  }
};

// 🔍 Get recent searches for user
export const getRecentSearches = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // For now, return empty array - we'll implement search history later
    res.status(200).json({
      recentSearches: [],
      suggestions: [
        "images",
        "documents", 
        "voice messages",
        "last week",
        "shared files"
      ]
    });
  } catch (error) {
    console.error("Error in getRecentSearches:", error);
    res.status(500).json({ error: "Failed to get recent searches" });
  }
};

// 🔍 Search users and groups for chat selection
export const searchChats = async (req, res) => {
  try {
    const { q: query } = req.query;
    const userId = req.user._id;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: "Search query is required" });
    }

    console.log(`🔍 Search chats: "${query}"`);

    // Search friends
    const user = await User.findById(userId).populate('friends', 'fullName profilePic');
    const matchingFriends = user.friends.filter(friend =>
      friend.fullName.toLowerCase().includes(query.toLowerCase())
    );

    // Search groups user is member of
    const matchingGroups = await Group.find({
      'members.user': userId,
      name: { $regex: query, $options: 'i' }
    }).select('name groupPic members').lean();

    res.status(200).json({
      friends: matchingFriends,
      groups: matchingGroups,
      query: query.trim()
    });

  } catch (error) {
    console.error("Error in searchChats:", error);
    res.status(500).json({ error: "Chat search failed" });
  }
};