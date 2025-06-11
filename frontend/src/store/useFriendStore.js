// store/useFriendStore.js
import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useFriendStore = create((set, get) => ({
  // Search & Discovery
  searchResults: [],
  isSearching: false,
  searchQuery: "",

  // Friend Requests
  pendingRequests: { received: [], sent: [] },
  isRequestsLoading: false,

  // Friends List
  friends: [],
  isFriendsLoading: false,

  // Search for users to add as friends
  searchUsers: async (query) => {
    if (!query.trim()) {
      set({ searchResults: [], searchQuery: "" });
      return;
    }

    set({ isSearching: true, searchQuery: query });
    try {
      const res = await axiosInstance.get(`/friends/search?query=${encodeURIComponent(query)}`);
      set({ searchResults: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to search users");
      set({ searchResults: [] });
    } finally {
      set({ isSearching: false });
    }
  },

  // Clear search results
  clearSearch: () => {
    set({ searchResults: [], searchQuery: "", isSearching: false });
  },

  // Send friend request
  sendFriendRequest: async (userId) => {
    try {
      await axiosInstance.post(`/friends/request/${userId}`);
      
      // Update search results to reflect new status
      const { searchResults } = get();
      const updatedResults = searchResults.map(user =>
        user._id === userId ? { ...user, friendStatus: 'sent' } : user
      );
      set({ searchResults: updatedResults });
      
      toast.success("Friend request sent!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send friend request");
    }
  },

  // Cancel friend request
  cancelFriendRequest: async (userId) => {
    try {
      await axiosInstance.delete(`/friends/cancel/${userId}`);
      
      // Update search results
      const { searchResults } = get();
      const updatedResults = searchResults.map(user =>
        user._id === userId ? { ...user, friendStatus: 'none' } : user
      );
      set({ searchResults: updatedResults });
      
      // Update pending requests
      const { pendingRequests } = get();
      const updatedSent = pendingRequests.sent.filter(req => req.to._id !== userId);
      set({ pendingRequests: { ...pendingRequests, sent: updatedSent } });
      
      toast.success("Friend request cancelled");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel friend request");
    }
  },

  // Accept friend request
  acceptFriendRequest: async (userId) => {
    try {
      await axiosInstance.post(`/friends/accept/${userId}`);
      
      // Remove from pending requests
      const { pendingRequests } = get();
      const updatedReceived = pendingRequests.received.filter(req => req.from._id !== userId);
      set({ pendingRequests: { ...pendingRequests, received: updatedReceived } });
      
      // Refresh friends list
      get().getFriends();
      
      toast.success("Friend request accepted!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to accept friend request");
    }
  },

  // Decline friend request
  declineFriendRequest: async (userId) => {
    try {
      await axiosInstance.post(`/friends/decline/${userId}`);
      
      // Remove from pending requests
      const { pendingRequests } = get();
      const updatedReceived = pendingRequests.received.filter(req => req.from._id !== userId);
      set({ pendingRequests: { ...pendingRequests, received: updatedReceived } });
      
      toast.success("Friend request declined");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to decline friend request");
    }
  },

  // Get pending friend requests
  getPendingRequests: async () => {
    set({ isRequestsLoading: true });
    try {
      const res = await axiosInstance.get("/friends/requests");
      set({ pendingRequests: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch friend requests");
    } finally {
      set({ isRequestsLoading: false });
    }
  },

  // Get friends list
  getFriends: async () => {
    set({ isFriendsLoading: true });
    try {
      const res = await axiosInstance.get("/friends");
      set({ friends: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch friends");
    } finally {
      set({ isFriendsLoading: false });
    }
  },

  // Remove friend
  removeFriend: async (friendId) => {
    try {
      await axiosInstance.delete(`/friends/${friendId}`);
      
      // Remove from friends list
      const { friends } = get();
      const updatedFriends = friends.filter(friend => friend._id !== friendId);
      set({ friends: updatedFriends });
      
      toast.success("Friend removed");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove friend");
    }
  },

  // Subscribe to friend request notifications
  subscribeToFriendRequests: () => {
    const socket = useAuthStore.getState().socket;
    
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
      // Refresh friends list
      get().getFriends();
    });
  },

  // Unsubscribe from friend request notifications
unsubscribeFromFriendRequests: () => {
  const socket = useAuthStore.getState().socket;

  if (!socket || typeof socket.off !== "function") return;

  socket.off("friendRequestReceived");
  socket.off("friendRequestAccepted");
},

}));