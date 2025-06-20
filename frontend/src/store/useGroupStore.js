// store/useGroupStore.js
import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const useGroupStore = create((set, get) => ({
  // Group data
  groups: [],
  currentGroup: null,
  groupMembers: [],
  
  // Loading states
  isGroupsLoading: false,
  isCreatingGroup: false,
  isUpdatingGroup: false,
  isMembersLoading: false,
  
  // Search & Discovery
  searchResults: [],
  isSearching: false,
  
  // Create new group
createGroup: async (groupData) => {
  set({ isCreatingGroup: true });
  try {
    const formData = new FormData();
    formData.append("name", groupData.name);
    formData.append("description", groupData.description || "");
    formData.append("memberIds", JSON.stringify(groupData.memberIds || []));
    formData.append("isPrivate", groupData.isPrivate || false);
    formData.append("allowMemberInvite", groupData.allowMemberInvite !== false);
    
    if (groupData.groupPic) {
      formData.append("groupPic", groupData.groupPic);
    }

    const res = await axiosInstance.post("/groups/create", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    toast.success("Group created successfully!");
    get().getMyGroups();
    return res.data;
  } catch (error) {
    // 🔧 FIX: Enhanced error handling
    toast.error(error.response?.data?.error || error.response?.data?.message || "Failed to create group");
    throw error;
  } finally {
    set({ isCreatingGroup: false });
  }
},

  // Get user's groups
getMyGroups: async () => {
  set({ isGroupsLoading: true });
  try {
    const res = await axiosInstance.get("/groups/my-groups");
    set({ groups: res.data });
  } catch (error) {
    // 🔧 FIX: Enhanced error handling
    toast.error(error.response?.data?.error || error.response?.data?.message || "Failed to fetch groups");
    set({ groups: [] }); // Reset on error
  } finally {
    set({ isGroupsLoading: false });
  }
},

  // Get group details
  getGroupDetails: async (groupId) => {
    try {
      const res = await axiosInstance.get(`/groups/${groupId}`);
      set({ currentGroup: res.data });
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch group details");
      throw error;
    }
  },

  // Update group
  updateGroup: async (groupId, groupData) => {
    set({ isUpdatingGroup: true });
    try {
      const formData = new FormData();
      
      if (groupData.name) formData.append("name", groupData.name);
      if (groupData.description !== undefined) formData.append("description", groupData.description);
      if (groupData.isPrivate !== undefined) formData.append("isPrivate", groupData.isPrivate);
      if (groupData.allowMemberInvite !== undefined) formData.append("allowMemberInvite", groupData.allowMemberInvite);
      if (groupData.maxMembers) formData.append("maxMembers", groupData.maxMembers);
      
      if (groupData.groupPic) {
        formData.append("groupPic", groupData.groupPic);
      }

      const res = await axiosInstance.put(`/groups/${groupId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      set({ currentGroup: res.data });
      toast.success("Group updated successfully!");
      get().getMyGroups(); // Refresh groups
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update group");
      throw error;
    } finally {
      set({ isUpdatingGroup: false });
    }
  },

  // Add members to group
  addMembers: async (groupId, userIds) => {
    try {
      await axiosInstance.post(`/groups/${groupId}/members`, { userIds });
      toast.success("Members added successfully!");
      
      // Refresh group details if viewing current group
      const { currentGroup } = get();
      if (currentGroup && currentGroup._id === groupId) {
        get().getGroupDetails(groupId);
      }
      get().getMyGroups(); // Refresh groups
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add members");
      throw error;
    }
  },

  // Remove member from group
  removeMember: async (groupId, userId) => {
    try {
      await axiosInstance.delete(`/groups/${groupId}/members/${userId}`);
      toast.success("Member removed successfully!");
      
      // Refresh group details if viewing current group
      const { currentGroup } = get();
      if (currentGroup && currentGroup._id === groupId) {
        get().getGroupDetails(groupId);
      }
      get().getMyGroups(); // Refresh groups
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove member");
      throw error;
    }
  },

  // Leave group
  leaveGroup: async (groupId) => {
    try {
      await axiosInstance.post(`/groups/${groupId}/leave`);
      toast.success("Left group successfully!");
      get().getMyGroups(); // Refresh groups
      
      // Clear current group if leaving current group
      const { currentGroup } = get();
      if (currentGroup && currentGroup._id === groupId) {
        set({ currentGroup: null });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to leave group");
      throw error;
    }
  },

  // Delete group
  deleteGroup: async (groupId) => {
    try {
      await axiosInstance.delete(`/groups/${groupId}`);
      toast.success("Group deleted successfully!");
      get().getMyGroups(); // Refresh groups
      
      // Clear current group if deleting current group
      const { currentGroup } = get();
      if (currentGroup && currentGroup._id === groupId) {
        set({ currentGroup: null });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete group");
      throw error;
    }
  },

  // Update member role
  updateMemberRole: async (groupId, userId, role) => {
    try {
      await axiosInstance.put(`/groups/${groupId}/members/${userId}/role`, { role });
      toast.success(`Member role updated to ${role}!`);
      
      // Refresh group details if viewing current group
      const { currentGroup } = get();
      if (currentGroup && currentGroup._id === groupId) {
        get().getGroupDetails(groupId);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update member role");
      throw error;
    }
  },

  // Search public groups
searchGroups: async (query) => {
  if (!query?.trim()) {
    set({ searchResults: [] });
    return;
  }

  set({ isSearching: true });
  try {
    const res = await axiosInstance.get(`/groups/search?query=${encodeURIComponent(query.trim())}`);
    set({ searchResults: res.data });
  } catch (error) {
    // 🔧 FIX: Enhanced error handling
    toast.error(error.response?.data?.error || error.response?.data?.message || "Failed to search groups");
    set({ searchResults: [] });
  } finally {
    set({ isSearching: false });
  }
},

  // Join public group
  joinGroup: async (groupId) => {
    try {
      await axiosInstance.post(`/groups/${groupId}/members`, { userIds: [] }); // Empty array means self-join
      toast.success("Joined group successfully!");
      get().getMyGroups(); // Refresh groups

      const { searchResults } = get();
      const updatedResults = searchResults.filter(group => group._id !== groupId);
      set({ searchResults: updatedResults });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to join group");
      throw error;
    }
  },

  // Clear search results
  clearSearch: () => {
    set({ searchResults: [], isSearching: false });
  },

  // Set current group
  setCurrentGroup: (group) => {
    set({ currentGroup: group });
  },

  // Clear current group
  clearCurrentGroup: () => {
    set({ currentGroup: null });
  },
}));