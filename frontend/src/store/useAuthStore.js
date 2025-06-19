import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "https://chat-app-g6hy.onrender.com/api" : "https://chat-app-g6hy.onrender.com/api";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      console.log("checkAuth response:", res.data);
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
        if (err.response?.status !== 401) {
    console.error("Error in checkAuth:", err);
  }

      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");

      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

connectSocket: () => {
  const { authUser } = get();
  if (!authUser || get().socket?.connected) return;

  const socketURL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "http://localhost:5001";
  
  const socket = io(socketURL, {
    query: {
      userId: authUser._id,
      // 🔥 ADD: Pass user info for calls
      userInfo: JSON.stringify({
        _id: authUser._id,
        fullName: authUser.fullName,
        profilePic: authUser.profilePic
      })
    },
    transports: ['websocket', 'polling'],
    upgrade: true,
    rememberUpgrade: true,
  });


  set({ socket: socket });

  // 🔧 Add connection event handlers
  socket.on("connect", () => {
    console.log("🔌 Socket connected successfully:", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("🔌 Socket disconnected:", reason);
  });

  socket.on("connect_error", (error) => {
    console.error("🔌 Socket connection error:", error);
  });

  socket.on("getOnlineUsers", (userIds) => {
    set({ onlineUsers: userIds });
  });

  // Add friend request notifications
  socket.on("friendRequestReceived", (data) => {
    // Handle in useFriendStore
  });

  socket.on("friendRequestAccepted", (data) => {
    // Handle in useFriendStore
  });
},
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
    set({ socket: null }); // 🔥 Clear socket from state
  },
}));
