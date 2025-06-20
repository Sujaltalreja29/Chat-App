// store/useFriendStore.js - Only critical fixes
import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useFriendStore = create((set, get) => ({
  searchResults: [],
  isSearching: false,
  searchQuery: "",
  pendingRequests: { received: [], sent: [] },
  isRequestsLoading: false,
  friends: [],
  isFriendsLoading: false,

  searchUsers: async (query) => {
    if (!query?.trim()) {
      set({ searchResults: [], searchQuery: "" });
      return;
    }

    set({ isSearching: true, searchQuery: query });
    try {
      const res = await axiosInstance.get(`/friends/search?query=${encodeURIComponent(query)}`);
      set({ searchResults: res.data });
    } catch (error) {
      // 🔧 FIX: Added null checks
      toast.error(error.response?.data?.error || error.response?.data?.message || "Search failed");
      set({ searchResults: [] });
    } finally {
      set({ isSearching: false });
    }
  },

  clearSearch: () => {
    set({ searchResults: [], searchQuery: "", isSearching: false });
  },

  sendFriendRequest: async (userId) => {
    try {
      await axiosInstance.post(`/friends/request/${userId}`);
      
      const { searchResults } = get();
      const updatedResults = searchResults.map(user =>
        user._id === userId ? { ...user, friendStatus: 'sent' } : user
      );
      set({ searchResults: updatedResults });
      
      toast.success("Friend request sent!");
    } catch (error) {
      // 🔧 FIX: Added null checks
      toast.error(error.response?.data?.error || error.response?.data?.message || "Failed to send request");
    }
  },

  cancelFriendRequest: async (userId) => {
    try {
      await axiosInstance.delete(`/friends/cancel/${userId}`);
      
      const { searchResults, pendingRequests } = get();
      const updatedResults = searchResults.map(user =>
        user._id === userId ? { ...user, friendStatus: 'none' } : user
      );
      const updatedSent = pendingRequests.sent.filter(req => req.to._id !== userId);
      
      set({ 
        searchResults: updatedResults,
        pendingRequests: { ...pendingRequests, sent: updatedSent }
      });
      
      toast.success("Friend request cancelled");
    } catch (error) {
      // 🔧 FIX: Added null checks
      toast.error(error.response?.data?.error || error.response?.data?.message || "Failed to cancel request");
    }
  },

  acceptFriendRequest: async (userId) => {
    try {
      await axiosInstance.post(`/friends/accept/${userId}`);
      
      const { pendingRequests } = get();
      const updatedReceived = pendingRequests.received.filter(req => req.from._id !== userId);
      set({ pendingRequests: { ...pendingRequests, received: updatedReceived } });
      
      get().getFriends();
      toast.success("Friend request accepted!");
    } catch (error) {
      // 🔧 FIX: Added null checks
      toast.error(error.response?.data?.error || error.response?.data?.message || "Failed to accept request");
    }
  },

  declineFriendRequest: async (userId) => {
    try {
      await axiosInstance.post(`/friends/decline/${userId}`);
      
      const { pendingRequests } = get();
      const updatedReceived = pendingRequests.received.filter(req => req.from._id !== userId);
      set({ pendingRequests: { ...pendingRequests, received: updatedReceived } });
      
      toast.success("Friend request declined");
    } catch (error) {
      // 🔧 FIX: Added null checks
      toast.error(error.response?.data?.error || error.response?.data?.message || "Failed to decline request");
    }
  },

  getPendingRequests: async () => {
    set({ isRequestsLoading: true });
    try {
      const res = await axiosInstance.get("/friends/requests");
      set({ pendingRequests: res.data });
    } catch (error) {
      // 🔧 FIX: Added null checks
      toast.error(error.response?.data?.error || error.response?.data?.message || "Failed to fetch requests");
    } finally {
      set({ isRequestsLoading: false });
    }
  },

  getFriends: async () => {
    set({ isFriendsLoading: true });
    try {
      const res = await axiosInstance.get("/friends");
      set({ friends: res.data });
    } catch (error) {
      // 🔧 FIX: Added null checks
      toast.error(error.response?.data?.error || error.response?.data?.message || "Failed to fetch friends");
    } finally {
      set({ isFriendsLoading: false });
    }
  },

  removeFriend: async (friendId) => {
    try {
      await axiosInstance.delete(`/friends/${friendId}`);
      
      const { friends } = get();
      const updatedFriends = friends.filter(friend => friend._id !== friendId);
      set({ friends: updatedFriends });
      
      toast.success("Friend removed");
    } catch (error) {
      // 🔧 FIX: Added null checks
      toast.error(error.response?.data?.error || error.response?.data?.message || "Failed to remove friend");
    }
  },

  subscribeToFriendRequests: () => {
    const socket = useAuthStore.getState().socket;
    
    // 🔧 FIX: Added null check
    if (!socket) return;
    
    socket.on("friendRequestReceived", (data) => {
      const { pendingRequests } = get();
      set({
        pendingRequests: {
          ...pendingRequests,
          received: [...pendingRequests.received, { from: data.from, createdAt: new Date() }]
        }
      });
      toast.success(`Friend request from ${data.from.fullName}`);
    });

    socket.on("friendRequestAccepted", (data) => {
      toast.success(`${data.by.fullName} accepted your friend request!`);
      get().getFriends();
    });
  },

  unsubscribeFromFriendRequests: () => {
    const socket = useAuthStore.getState().socket;

    // 🔧 FIX: Enhanced null checks
    if (!socket || typeof socket.off !== "function") return;

    try {
      socket.off("friendRequestReceived");
      socket.off("friendRequestAccepted");
    } catch (error) {
      console.error('Error unsubscribing from friend requests:', error);
    }
  },
}));