// store/useChatStore.js
import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [], // Now will contain friends only
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

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

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const formData = new FormData();
      formData.append("text", messageData.text);

      if (messageData.imageFile) {
        formData.append("image", messageData.imageFile);
      }

      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));