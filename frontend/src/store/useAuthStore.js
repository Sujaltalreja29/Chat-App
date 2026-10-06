// store/useAuthStore.js - With Google Auth
import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isResettingDemo: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error("Error in checkAuth:", error);
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
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      set({ isSigningUp: false });
    }
  },

  // 🆕 Google Signup
  signupWithGoogle: async (credential) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/google-signup", {
        credential: credential
      });
      set({ authUser: res.data });
      toast.success("Account created successfully with Google!");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Google signup failed");
      throw error;
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
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  demoLogin: async () => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/demo-login");
      set({ authUser: res.data });
      toast.success("Welcome to the live demo");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Demo login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  switchDemoAccount: async (account) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/demo-login", { account });
      get().disconnectSocket();
      set({ authUser: res.data });
      toast.success(`Switched to ${res.data.fullName}`);
      get().connectSocket();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not switch demo account");
      return false;
    } finally {
      set({ isLoggingIn: false });
    }
  },

  resetDemo: async () => {
    set({ isResettingDemo: true });
    try {
      await axiosInstance.post("/auth/demo-reset");
      toast.success("Demo restored to its starting state");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not reset the demo");
      return false;
    } finally {
      set({ isResettingDemo: false });
    }
  },

  // 🆕 Google Login
  loginWithGoogle: async (credential) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/google-login", {
        credential: credential
      });
      set({ authUser: res.data });
      toast.success("Logged in successfully with Google!");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Google login failed");
      throw error;
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
      toast.error(error.response?.data?.message || "Logout failed");
      get().disconnectSocket();
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
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socketURL = import.meta.env.VITE_SOCKET_URL;
    
    const socket = io(socketURL, {
      query: {
        userId: authUser._id,
      },
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true,
    });

    set({ socket: socket });

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
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      try {
        if (socket.connected) socket.disconnect();
        socket.removeAllListeners();
      } catch (error) {
        console.error('Socket disconnect error:', error);
      }
    }
    set({ socket: null, onlineUsers: [] });
  },
}));