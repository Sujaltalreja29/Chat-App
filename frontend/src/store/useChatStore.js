// store/useChatStore.js
import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [], // Now will contain friends only
  groups: [], // User's groups
  selectedUser: null,
  selectedGroup: null,
  isUsersLoading: false,
  isGroupsLoading: false,
  isMessagesLoading: false,
  chatType: 'direct', // 'direct' or 'group'

  // Renamed for clarity - this now gets friends only
  getFriends: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/friends");
      set({ users: res.data }); // Still using 'users' to maintain compatibility
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

   getGroups: async () => {
    set({ isGroupsLoading: true });
    try {
      const res = await axiosInstance.get("/messages/groups/sidebar");
      set({ groups: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch groups");
    } finally {
      set({ isGroupsLoading: false });
    }
  },

  getMessages: async (userId,type = 'direct') => {
    set({ isMessagesLoading: true });
    try {
      let res;
      if (type === 'group') {
        res = await axiosInstance.get(`/groups/${userId}/messages`);
      } else {
        res = await axiosInstance.get(`/messages/${userId}`);
      }
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, selectedGroup, messages, chatType } = get();
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
        set({ messages: [...messages, res.data] });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  // 🔥 FIXED: Socket subscription logic
  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    
    // Get current state
    const { selectedUser, selectedGroup, chatType } = get();
    
    // Don't subscribe if no chat is selected
    if (!selectedUser && !selectedGroup) return;

    // 🔥 FIX: Handle both direct and group messages properly
    socket.on("newMessage", (newMessage) => {
      const { selectedUser, chatType } = get();
      if (chatType === 'direct' && selectedUser) {
        const isMessageFromSelectedUser = newMessage.senderId === selectedUser._id;
        if (isMessageFromSelectedUser) {
          set({ messages: [...get().messages, newMessage] });
        }
      }
    });

    // 🔥 FIX: Group message handling
    socket.on("newGroupMessage", (newMessage) => {
      const { selectedGroup, chatType } = get();
      if (chatType === 'group' && selectedGroup) {
        const isMessageFromSelectedGroup = newMessage.groupId === selectedGroup._id;
        if (isMessageFromSelectedGroup) {
          set({ messages: [...get().messages, newMessage] });
        }
      }
    });

    // Group-related socket events
  socket.on("addedToGroup", (data) => {
    toast.success(`Added to group: ${data.group.name}`);
    get().getGroups(); // Refresh groups
  });

    socket.on("removedFromGroup", (data) => {
      toast.error(`Removed from group: ${data.groupName}`);
      get().getGroups(); // Refresh groups
      
      // If currently viewing the group, clear selection
      const { selectedGroup } = get();
      if (selectedGroup && selectedGroup._id === data.groupId) {
        set({ selectedGroup: null, messages: [] });
      }
    });

    socket.on("groupDeleted", (data) => {
      toast.error(`Group "${data.groupName}" was deleted`);
      get().getGroups(); // Refresh groups
      
      // If currently viewing the group, clear selection
      const { selectedGroup } = get();
      if (selectedGroup && selectedGroup._id === data.groupId) {
        set({ selectedGroup: null, messages: [] });
      }
    });

    // 🔥 FIX: Update current group data when group is updated
socket.on("groupUpdated", (data) => {
  toast.success(`Group "${data.group.name}" was updated`);
  
  // 🔥 FIX: Update groups list immediately
  const { groups } = get();
  const updatedGroups = groups.map(group => 
    group._id === data.group._id ? data.group : group
  );
  set({ groups: updatedGroups });
  
  // 🔥 FIX: Update selected group if it's the one being viewed
  const { selectedGroup } = get();
  if (selectedGroup && selectedGroup._id === data.group._id) {
    set({ selectedGroup: data.group });
  }
  
  // 🔥 Also refresh groups from server to ensure consistency
  setTimeout(() => {
    get().getGroups();
  }, 100);
});

    // 🔥 NEW: Handle member updates
  socket.on("groupMembersAdded", (data) => {
    toast.success(`New members added to ${data.group.name}`);
    
    // Update groups list immediately
    const { groups } = get();
    const updatedGroups = groups.map(group => 
      group._id === data.group._id ? data.group : group
    );
    set({ groups: updatedGroups });
    
    // Update selected group if it's the one being viewed
    const { selectedGroup } = get();
    if (selectedGroup && selectedGroup._id === data.group._id) {
      set({ selectedGroup: data.group });
    }
  });

  // 🔥 FIX: Handle member removed event
  socket.on("groupMemberRemoved", (data) => {
    // Update groups list immediately  
    const { groups } = get();
    const updatedGroups = groups.map(group => 
      group._id === data.group._id ? data.group : group
    );
    set({ groups: updatedGroups });
    
    // Update selected group if it's the one being viewed
    const { selectedGroup } = get();
    if (selectedGroup && selectedGroup._id === data.group._id) {
      set({ selectedGroup: data.group });
    }
  });

  socket.on("groupMemberLeft", (data) => {
    // Update groups list immediately
    const { groups } = get();
    const updatedGroups = groups.map(group => 
      group._id === data.group._id ? data.group : group
    );
    set({ groups: updatedGroups });
    
    // Update selected group if it's the one being viewed  
    const { selectedGroup } = get();
    if (selectedGroup && selectedGroup._id === data.group._id) {
      set({ selectedGroup: data.group });
    }
  });

  socket.on("groupRoleChanged", (data) => {
    toast.success(`Your role was changed to ${data.newRole}`);
    const { selectedGroup } = get();
    if (selectedGroup && selectedGroup._id === data.groupId) {
      // Refresh current group details
      get().refreshCurrentGroup();
    }
  });

  socket.on("groupMemberRoleChanged", (data) => {
    // Update groups list and selected group
    const { groups, selectedGroup } = get();
    if (selectedGroup && selectedGroup._id === data.group._id) {
      set({ selectedGroup: data.group });
    }
    
    const updatedGroups = groups.map(group => 
      group._id === data.group._id ? data.group : group
    );
    set({ groups: updatedGroups });
  });
},

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("newGroupMessage");
    socket.off("addedToGroup");
    socket.off("removedFromGroup");
    socket.off("groupDeleted");
    socket.off("groupUpdated");
    // 🔥 NEW: Unsubscribe from member events
    socket.off("groupMembersAdded");
    socket.off("groupMemberRemoved");
    socket.off("groupMemberLeft");
    socket.off("groupRoleChanged");
    socket.off("groupMemberRoleChanged");
  },

  // 🔥 NEW: Refresh current group details
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

  // Selection functions
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
    
    // Automatically fetch group messages when group is selected
    if (selectedGroup) {
      get().getMessages(selectedGroup._id, 'group');
    }
  },

  // Clear current chat
  clearChat: () => {
    set({ 
      selectedUser: null, 
      selectedGroup: null, 
      messages: [],
      chatType: 'direct'
    });
  },
}));