// store/useChatStore.js
import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

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

  getMessages: async (userId, type = 'direct') => {
    set({ isMessagesLoading: true });
    try {
      let res;
      if (type === 'group') {
        res = await axiosInstance.get(`/groups/${userId}/messages`);
      } else {
        res = await axiosInstance.get(`/messages/${userId}`);
      }
      set({ messages: res.data });
      
      // 🔥 NEW: Mark messages as read when opening chat
      await get().markMessagesAsRead(userId, type);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

sendMessage: async (messageData) => {
  const { selectedUser, selectedGroup, messages, chatType } = get();
  const { authUser } = useAuthStore.getState(); // Get authUser properly
  
  try {
    const formData = new FormData();
    formData.append("text", messageData.text);

    if (messageData.imageFile) {
      formData.append("image", messageData.imageFile);
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
  
  console.log("🔥 DEBUG: Subscribing to messages");
  console.log("🔥 DEBUG: Socket exists:", !!socket);
  console.log("🔥 DEBUG: Socket connected:", socket?.connected);
  console.log("🔥 DEBUG: Auth user:", authUser?._id);
  
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
    
    // Handle new direct messages
    socket.on("newMessage", (newMessage) => {
      console.log("📨 DEBUG: Received newMessage event:", newMessage);
      console.log("📨 DEBUG: Sender ID:", newMessage.senderId);
      console.log("📨 DEBUG: Current user ID:", authUser._id);
      
      const { selectedUser, chatType } = get();
      console.log("📨 DEBUG: Selected user:", selectedUser?._id);
      console.log("📨 DEBUG: Chat type:", chatType);
      
      // Check if this message is from the currently selected user
      const isFromSelectedUser = selectedUser && (
        newMessage.senderId === selectedUser._id || 
        newMessage.senderId._id === selectedUser._id
      );
      
      const isCurrentChatDirect = chatType === 'direct';
      
      console.log("📨 DEBUG: Is from selected user:", isFromSelectedUser);
      console.log("📨 DEBUG: Is direct chat:", isCurrentChatDirect);
      
      if (isCurrentChatDirect && isFromSelectedUser) {
        console.log("📨 DEBUG: Adding to current chat messages");
        set({ messages: [...get().messages, newMessage] });
        get().markMessagesAsRead(selectedUser._id, 'direct');
      } else {
        console.log("📨 DEBUG: Adding to notifications");
        get().handleNewMessageNotification(newMessage, 'direct');
      }
    });

    // Handle new group messages  
    socket.on("newGroupMessage", (newMessage) => {
      console.log("📨 DEBUG: Received newGroupMessage event:", newMessage);
      
      const { selectedGroup, chatType } = get();
      
      const isFromSelectedGroup = selectedGroup && newMessage.groupId === selectedGroup._id;
      const isCurrentChatGroup = chatType === 'group';
      
      console.log("📨 DEBUG: Is from selected group:", isFromSelectedGroup);
      console.log("📨 DEBUG: Is group chat:", isCurrentChatGroup);
      
      if (isCurrentChatGroup && isFromSelectedGroup) {
        console.log("📨 DEBUG: Adding to current group chat messages");
        set({ messages: [...get().messages, newMessage] });
        get().markMessagesAsRead(selectedGroup._id, 'group');
      } else {
        console.log("📨 DEBUG: Adding to group notifications");
        get().handleNewMessageNotification(newMessage, 'group');
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
    set({ 
      selectedUser: null, 
      selectedGroup: null, 
      messages: [],
      chatType: 'direct'
    });
  },
}));