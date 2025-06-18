// store/useChatStore.js
import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import usePagination from '../hooks/usePagination';
import useTyping from '../hooks/useTyping';

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [], // Friends with message info
  groups: [], // Groups with message info
  selectedUser: null,
  selectedGroup: null,
  isUsersLoading: false,
  isGroupsLoading: false,
  isMessagesLoading: false,
  chatType: 'direct',
    typingUsers: [],
  isUserTyping: false,
  
    messagesPage: 1,
  hasMoreMessages: true,
  isLoadingMessages: false,
  isLoadingMoreMessages: false,

  messageCache: new Map(),

  // 🔥 NEW: Notification related state
  totalUnreadCount: 0,
  unreadCounts: { direct: [], group: [] },

  // 🔥 NEW: Mark messages as read
  markMessagesAsRead: async (chatId, chatType) => {
    try {
      if (chatType === 'direct') {
        await axiosInstance.post(`/messages/mark-read/direct/${chatId}`);
      } else if (chatType === 'group') {
        await axiosInstance.post(`/messages/mark-read/group/${chatId}`);
      }
      
      // Update local state
      get().updateLocalUnreadCount(chatId, chatType);
    } catch (error) {
      console.error("Failed to mark messages as read:", error);
    }
  },

  // 🔥 NEW: Update local unread count
  updateLocalUnreadCount: (chatId, chatType) => {
    if (chatType === 'direct') {
      const { users } = get();
      const updatedUsers = users.map(user => 
        user._id === chatId ? { ...user, unreadCount: 0 } : user
      );
      set({ users: updatedUsers });
    } else if (chatType === 'group') {
      const { groups } = get();
      const updatedGroups = groups.map(group => 
        group._id === chatId ? { ...group, unreadCount: 0 } : group
      );
      set({ groups: updatedGroups });
    }
    
    // Recalculate total unread count
    get().calculateTotalUnreadCount();
  },

  // 🔥 NEW: Calculate total unread count
  calculateTotalUnreadCount: () => {
    const { users, groups } = get();
    const directUnread = users.reduce((sum, user) => sum + (user.unreadCount || 0), 0);
    const groupUnread = groups.reduce((sum, group) => sum + (group.unreadCount || 0), 0);
    const total = directUnread + groupUnread;
    
    set({ totalUnreadCount: total });
    
    // Update document title with unread count
    document.title = total > 0 ? `(${total}) Chatty - Stay Connected` : 'Chatty - Stay Connected';
  },

  // 🔥 UPDATED: Enhanced getFriends with message info
  getFriends: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
      get().calculateTotalUnreadCount();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch friends");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  // Keep legacy method for backward compatibility
  getUsers: async () => {
    return get().getFriends();
  },

  // 🔥 UPDATED: Enhanced getGroups with message info
  getGroups: async () => {
    set({ isGroupsLoading: true });
    try {
      const res = await axiosInstance.get("/messages/groups/sidebar");
      set({ groups: res.data });
      get().calculateTotalUnreadCount();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch groups");
    } finally {
      set({ isGroupsLoading: false });
    }
  },

  getMessages: async (userId, type = 'direct', page = 1, useCache = true) => {
    const chatId = type === 'group' ? userId : 
      [get().selectedUser?._id, useAuthStore.getState().authUser?._id].sort().join('-');
    
    // Check cache first
    if (useCache && page === 1) {
      const cached = get().messageCache.get(`${chatId}-${type}`);
      if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
        set({ 
          messages: cached.messages,
          hasMoreMessages: cached.hasMore 
        });
                await get().markMessagesAsRead(userId, type);
        return;
      }
    }

    set({ isLoadingMessages: true });
    try {
      let res;
      if (type === 'group') {
        res = await axiosInstance.get(`/groups/${userId}/messages`, {
          params: { page, limit: 50 }
        });
      } else {
        res = await axiosInstance.get(`/messages/${userId}`, {
          params: { page, limit: 50 }
        });
      }

      const { messages, pagination } = res.data;
      
      set({ 
        messages,
        hasMoreMessages: pagination?.hasMore || false,
        messagesPage: page
      });
      
      // Cache messages
      get().messageCache.set(`${chatId}-${type}`, {
        messages,
        hasMore: pagination?.hasMore || false,
        timestamp: Date.now()
      });
      
      // Mark messages as read when opening chat
      await get().markMessagesAsRead(userId, type);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch messages");
    } finally {
      set({ isLoadingMessages: false });
    }
  },

    // 🔥 NEW: Load more messages for infinite scroll
  loadMoreMessages: async (userId, type = 'direct') => {
    const { hasMoreMessages, isLoadingMoreMessages, messages } = get();
    
    if (!hasMoreMessages || isLoadingMoreMessages || messages.length === 0) return;

    set({ isLoadingMoreMessages: true });
    try {
      const oldestMessage = messages[0];
      const beforeTimestamp = oldestMessage.createdAt;

      let res;
      if (type === 'group') {
        res = await axiosInstance.get(`/groups/${userId}/messages/before`, {
          params: { before: beforeTimestamp, limit: 50 }
        });
      } else {
        res = await axiosInstance.get(`/messages/${userId}/before`, {
          params: { before: beforeTimestamp, limit: 50 }
        });
      }

      const { messages: olderMessages, hasMore } = res.data;
      
      if (olderMessages.length > 0) {
        set({ 
          messages: [...olderMessages, ...messages],
          hasMoreMessages: hasMore
        });
      } else {
        set({ hasMoreMessages: false });
      }
    } catch (error) {
      console.error('Failed to load more messages:', error);
      toast.error('Failed to load more messages');
    } finally {
      set({ isLoadingMoreMessages: false });
    }
  },

    handleTyping: (inputValue) => {
    const { selectedUser, selectedGroup, chatType } = get();
    const { socket, authUser } = useAuthStore.getState();
    
    if (!socket || !authUser) return;

    let chatId;
    if (chatType === 'group' && selectedGroup) {
      chatId = `group:${selectedGroup._id}`;
    } else if (chatType === 'direct' && selectedUser) {
      chatId = `direct:${[selectedUser._id, authUser._id].sort().join('-')}`;
    } else {
      return;
    }

    // Debounced typing logic
    clearTimeout(get().typingTimeout);
    
    if (!get().isUserTyping) {
      set({ isUserTyping: true });
      
      socket.emit('typing', {
        chatId,
        chatType,
        isTyping: true,
        userInfo: {
          userId: authUser._id,
          fullName: authUser.fullName,
          profilePic: authUser.profilePic
        }
      });
    }

    // Set timeout to stop typing
    const timeout = setTimeout(() => {
      set({ isUserTyping: false });
      
      socket.emit('typing', {
        chatId,
        chatType,
        isTyping: false,
        userInfo: {
          userId: authUser._id,
          fullName: authUser.fullName,
          profilePic: authUser.profilePic
        }
      });
    }, 2000);

    set({ typingTimeout: timeout });
  },

  // 🔥 NEW: Stop typing
  stopTyping: () => {
    const { selectedUser, selectedGroup, chatType, isUserTyping } = get();
    const { socket, authUser } = useAuthStore.getState();
    
    if (!socket || !authUser || !isUserTyping) return;

    let chatId;
    if (chatType === 'group' && selectedGroup) {
      chatId = `group:${selectedGroup._id}`;
    } else if (chatType === 'direct' && selectedUser) {
      chatId = `direct:${[selectedUser._id, authUser._id].sort().join('-')}`;
    } else {
      return;
    }

    set({ isUserTyping: false });
    clearTimeout(get().typingTimeout);
    
    socket.emit('typing', {
      chatId,
      chatType,
      isTyping: false,
      userInfo: {
        userId: authUser._id,
        fullName: authUser.fullName,
        profilePic: authUser.profilePic
      }
    });
  },

sendMessage: async (messageData) => {
  const { selectedUser, selectedGroup, messages, chatType } = get();
  const { authUser } = useAuthStore.getState(); // Get authUser properly
  
  try {
    const formData = new FormData();
    // Add text if provided
    if (messageData.text) {
      formData.append("text", messageData.text);
    }

    // 🔥 ENHANCED: Handle any file type
    if (messageData.file) {
      formData.append("file", messageData.file); // Changed from "image" to "file"
    }
    // Legacy support for imageFile
    else if (messageData.imageFile) {
      formData.append("file", messageData.imageFile);
    }

    let res;
    if (chatType === 'group' && selectedGroup) {
      res = await axiosInstance.post(`/messages/send-group/${selectedGroup._id}`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
    } else if (chatType === 'direct' && selectedUser) {
      res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
    }

    if (res) {
      // 🔥 FIX: Ensure the message has proper senderId population
      const messageWithSender = {
        ...res.data,
        senderId: {
          _id: authUser._id,
          fullName: authUser.fullName,
          profilePic: authUser.profilePic
        }
      };
      
      set({ messages: [...messages, messageWithSender] });
      
      // Update sidebar with new message
      if (chatType === 'direct') {
        get().updateUserLastMessage(selectedUser._id, messageWithSender);
      } else if (chatType === 'group') {
        get().updateGroupLastMessage(selectedGroup._id, messageWithSender);
      }
    }
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to send message");
  }
},

// 🆕 Send voice note function
// Update the sendVoiceNote function to properly handle real-time updates:
// 🔧 FIXED: Voice note sending function
sendVoiceNote: async ({ audioBlob, duration, waveform, receiverId, groupId, chatType }) => {
  const { messages } = get();
  const { authUser } = useAuthStore.getState();
  
  try {
    const formData = new FormData();
    formData.append("audio", audioBlob, "voice-note.webm");
    formData.append("duration", duration.toString());
    formData.append("waveform", JSON.stringify(waveform));

    let res;
    if (chatType === 'group' && groupId) {
      res = await axiosInstance.post(`/voice/group/${groupId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } else if (chatType === 'direct' && receiverId) {
      res = await axiosInstance.post(`/voice/${receiverId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } else {
      throw new Error("Invalid chat configuration");
    }

    // 🔧 FIXED: Don't manually add to messages - let socket handle it
    // The message will be received via socket and added through subscribeToMessages
    console.log("✅ Voice note sent successfully");
    
    // Update sidebar with new voice message only if socket doesn't handle it
    // This is a fallback for immediate UI feedback
    if (res && res.data) {
      const messageWithSender = {
        ...res.data,
        senderId: {
          _id: authUser._id,
          fullName: authUser.fullName,
          profilePic: authUser.profilePic
        }
      };
      
      // Update sidebar (but not current messages - socket will handle that)
      if (chatType === 'direct') {
        get().updateUserLastMessage(receiverId, messageWithSender);
      } else if (chatType === 'group') {
        get().updateGroupLastMessage(groupId, messageWithSender);
      }
    }
    
    return res.data;
    
  } catch (error) {
    console.error("Error sending voice note:", error);
    throw error;
  }
},

  // 🔥 NEW: Update user's last message in sidebar
  updateUserLastMessage: (userId, message) => {
    const { users } = get();
    const updatedUsers = users.map(user => 
      user._id === userId ? { ...user, lastMessage: message } : user
    );
    set({ users: updatedUsers });
  },

  // 🔥 NEW: Update group's last message in sidebar
  updateGroupLastMessage: (groupId, message) => {
    const { groups } = get();
    const updatedGroups = groups.map(group => 
      group._id === groupId ? { ...group, lastMessage: message } : group
    );
    set({ groups: updatedGroups });
  },

  // 🔥 UPDATED: Enhanced socket subscription
// Update the subscribeToMessages function in useChatStore.js:

subscribeToMessages: () => {
  const socket = useAuthStore.getState().socket;
  const { authUser } = useAuthStore.getState();   
  if (!socket) {
    console.log("❌ No socket available");
    return;
  }

  // 🔥 FIX: Wait for socket to connect before subscribing
  const setupEventListeners = () => {
    console.log("✅ Setting up event listeners - Socket connected:", socket.connected);
    
    // Remove existing listeners to avoid duplicates
    socket.off("newMessage");
    socket.off("newGroupMessage");
    socket.off("typingUpdate");
    
    // Handle new direct messages
    socket.on("newMessage", (newMessage) => {
      console.log("📥 Received new message:", newMessage);
      const { selectedUser, chatType } = get();
      const isFromSelectedUser = selectedUser && (
        newMessage.senderId === selectedUser._id || 
        (newMessage.senderId._id && newMessage.senderId._id === selectedUser._id)
      );
      
      if (chatType === 'direct' && isFromSelectedUser) {
        console.log("📥 Adding message to current chat");
        set({ messages: [...get().messages, newMessage] });
        get().markMessagesAsRead(selectedUser._id, 'direct');
      } else {
        console.log("📥 Adding message to sidebar notification");
        get().handleNewMessageNotification(newMessage, 'direct');
      }
    });

    // Handle new group messages (including voice notes)
    socket.on("newGroupMessage", (newMessage) => {
      console.log("📥 Received new group message:", newMessage);
      const { selectedGroup, chatType } = get();
      const isFromSelectedGroup = selectedGroup && newMessage.groupId === selectedGroup._id;
      
      if (chatType === 'group' && isFromSelectedGroup) {
        console.log("📥 Adding group message to current chat");
        set({ messages: [...get().messages, newMessage] });
        get().markMessagesAsRead(selectedGroup._id, 'group');
      } else {
        console.log("📥 Adding group message to sidebar notification");
        get().handleNewMessageNotification(newMessage, 'group');
      }
    });

    // Handle typing updates
    socket.on("typingUpdate", (data) => {
      const { selectedUser, selectedGroup, chatType } = get();
      let currentChatId;
      
      if (chatType === 'group' && selectedGroup) {
        currentChatId = `group:${selectedGroup._id}`;
      } else if (chatType === 'direct' && selectedUser) {
        currentChatId = `direct:${[selectedUser._id, authUser._id].sort().join('-')}`;
      }
      
      if (data.chatId === currentChatId) {
        const otherTypingUsers = data.typingUsers.filter(
          user => user.userId !== authUser._id
        );
        set({ typingUsers: otherTypingUsers });
      }
    });


    // Other socket events...
    socket.on("addedToGroup", (data) => {
      toast.success(`Added to group: ${data.group.name}`);
      get().getGroups();
    });

    socket.on("removedFromGroup", (data) => {
      toast.error(`Removed from group: ${data.groupName}`);
      get().getGroups();
      
      const { selectedGroup } = get();
      if (selectedGroup && selectedGroup._id === data.groupId) {
        set({ selectedGroup: null, messages: [] });
      }
    });

    socket.on("groupDeleted", (data) => {
      toast.error(`Group "${data.groupName}" was deleted`);
      get().getGroups();
      
      const { selectedGroup } = get();
      if (selectedGroup && selectedGroup._id === data.groupId) {
        set({ selectedGroup: null, messages: [] });
      }
    });

    socket.on("groupUpdated", (data) => {
      toast.success(`Group "${data.group.name}" was updated`);
      
      const { groups } = get();
      const updatedGroups = groups.map(group => 
        group._id === data.group._id ? { ...group, ...data.group } : group
      );
      set({ groups: updatedGroups });
      
      const { selectedGroup } = get();
      if (selectedGroup && selectedGroup._id === data.group._id) {
        set({ selectedGroup: data.group });
      }
    });

    socket.on("groupMembersAdded", (data) => {
      const { groups } = get();
      const updatedGroups = groups.map(group => 
        group._id === data.group._id ? data.group : group
      );
      set({ groups: updatedGroups });
      
      const { selectedGroup } = get();
      if (selectedGroup && selectedGroup._id === data.group._id) {
        set({ selectedGroup: data.group });
      }
    });

    socket.on("groupMemberRemoved", (data) => {
      const { groups } = get();
      const updatedGroups = groups.map(group => 
        group._id === data.group._id ? data.group : group
      );
      set({ groups: updatedGroups });
      
      const { selectedGroup } = get();
      if (selectedGroup && selectedGroup._id === data.group._id) {
        set({ selectedGroup: data.group });
      }
    });

    socket.on("groupMemberLeft", (data) => {
      const { groups } = get();
      const updatedGroups = groups.map(group => 
        group._id === data.group._id ? data.group : group
      );
      set({ groups: updatedGroups });
      
      const { selectedGroup } = get();
      if (selectedGroup && selectedGroup._id === data.group._id) {
        set({ selectedGroup: data.group });
      }
    });

    socket.on("groupRoleChanged", (data) => {
      toast.success(`Your role was changed to ${data.newRole}`);
      const { selectedGroup } = get();
      if (selectedGroup && selectedGroup._id === data.groupId) {
        get().refreshCurrentGroup();
      }
    });

    socket.on("groupMemberRoleChanged", (data) => {
      const { groups, selectedGroup } = get();
      if (selectedGroup && selectedGroup._id === data.group._id) {
        set({ selectedGroup: data.group });
      }
      
      const updatedGroups = groups.map(group => 
        group._id === data.group._id ? data.group : group
      );
      set({ groups: updatedGroups });
    });
  };

  // 🔥 FIX: Setup listeners based on connection status
  if (socket.connected) {
    console.log("🔌 Socket already connected, setting up listeners immediately");
    setupEventListeners();
  } else {
    console.log("🔌 Socket not connected, waiting for connection...");
    
    // Wait for socket to connect
    socket.on("connect", () => {
      console.log("🔌 Socket connected! Setting up listeners now");
      setupEventListeners();
    });
    
    // Also listen for reconnection
    socket.on("reconnect", () => {
      console.log("🔌 Socket reconnected! Setting up listeners again");
      setupEventListeners();
    });
  }

  // Test socket connection (do this regardless of connection status)
  const testConnection = () => {
    if (socket.connected) {
      socket.emit("test", "Hello from client");
      socket.on("test-response", (data) => {
        console.log("✅ Socket connection test successful:", data);
      });
    }
  };
  
  // Test immediately if connected, or wait for connection
  if (socket.connected) {
    testConnection();
  } else {
    socket.on("connect", testConnection);
  }
},

  // 🔥 NEW: Handle new message notifications
handleNewMessageNotification: (message, type) => {
  const { authUser } = useAuthStore.getState();
  
  console.log("🔔 DEBUG: handleNewMessageNotification called");
  console.log("🔔 DEBUG: Message:", message);
  console.log("🔔 DEBUG: Type:", type);
  console.log("🔔 DEBUG: Auth user:", authUser._id);
  
  // Get sender ID (handle both string and object cases)
  const senderId = typeof message.senderId === 'string' ? message.senderId : message.senderId._id;
  console.log("🔔 DEBUG: Sender ID:", senderId);
  
  // Don't create notification for own messages
  if (senderId === authUser._id) {
    console.log("🔔 DEBUG: Ignoring own message");
    return;
  }
  
  if (type === 'direct') {
    console.log("🔔 DEBUG: Processing direct message notification");
    const { users } = get();
    console.log("🔔 DEBUG: Current users:", users.length);
    
    const updatedUsers = users.map(user => {
      if (user._id === senderId) {
        console.log("🔔 DEBUG: Updating user:", user.fullName);
        return {
          ...user,
          lastMessage: message,
          unreadCount: (user.unreadCount || 0) + 1
        };
      }
      return user;
    });
    
    // Sort users by last message time
    updatedUsers.sort((a, b) => {
      const aTime = a.lastMessage?.createdAt || 0;
      const bTime = b.lastMessage?.createdAt || 0;
      return new Date(bTime) - new Date(aTime);
    });
    
    console.log("🔔 DEBUG: Setting updated users");
    set({ users: updatedUsers });
    
  } else if (type === 'group') {
    console.log("🔔 DEBUG: Processing group message notification");
    const { groups } = get();
    const groupId = message.groupId;
    
    const updatedGroups = groups.map(group => {
      if (group._id === groupId) {
        console.log("🔔 DEBUG: Updating group:", group.name);
        return {
          ...group,
          lastMessage: message,
          unreadCount: (group.unreadCount || 0) + 1
        };
      }
      return group;
    });
    
    // Sort groups by last message time
    updatedGroups.sort((a, b) => {
      const aTime = a.lastMessage?.createdAt || a.lastActivity || 0;
      const bTime = b.lastMessage?.createdAt || b.lastActivity || 0;
      return new Date(bTime) - new Date(aTime);
    });
    
    console.log("🔔 DEBUG: Setting updated groups");
    set({ groups: updatedGroups });
  }
  
  console.log("🔔 DEBUG: Calculating total unread count");
  get().calculateTotalUnreadCount();  
},

// In useChatStore.js - update unsubscribeFromMessages:

unsubscribeFromMessages: () => {
  const socket = useAuthStore.getState().socket;
  if (!socket) return;
  
  console.log("🔌 Unsubscribing from all socket events");
  
  socket.off("newMessage");
  socket.off("newGroupMessage");
  socket.off("addedToGroup");
  socket.off("removedFromGroup");
  socket.off("groupDeleted");
  socket.off("groupUpdated");
  socket.off("groupMembersAdded");
  socket.off("groupMemberRemoved");
  socket.off("groupMemberLeft");
  socket.off("groupRoleChanged");
  socket.off("groupMemberRoleChanged");
  socket.off("connect");
  socket.off("reconnect");
  socket.off("test-response");
},

  refreshCurrentGroup: async () => {
    const { selectedGroup } = get();
    if (selectedGroup) {
      try {
        const res = await axiosInstance.get(`/groups/${selectedGroup._id}`);
        set({ selectedGroup: res.data });
      } catch (error) {
        console.error("Failed to refresh group details:", error);
      }
    }
  },

  setSelectedUser: (selectedUser) => {
    set({ 
      selectedUser, 
      selectedGroup: null, 
      chatType: 'direct',
      messages: [] 
    });

    if (selectedUser) {
      get().getMessages(selectedUser._id, 'direct');
    }
  },

  setSelectedGroup: (selectedGroup) => {
    set({ 
      selectedGroup, 
      selectedUser: null, 
      chatType: 'group',
      messages: [] 
    });
    
    if (selectedGroup) {
      get().getMessages(selectedGroup._id, 'group');
    }
  },

  clearChat: () => {
    get().stopTyping();
    set({ 
      selectedUser: null, 
      selectedGroup: null, 
      messages: [],
      chatType: 'direct',
      typingUsers: [],
      isUserTyping: false,
      hasMoreMessages: true,
      messagesPage: 1
    });
  },
}));