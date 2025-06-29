// src/App.jsx - Updated padding logic
import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

import Navbar from "./components/Navbar";
import ThemeProvider from './components/ThemeProvider';

import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import FriendsPage from './pages/FriendsPage';
import GroupsPage from './pages/GroupsPage';

import { useFriendStore } from './store/useFriendStore';
import { useGroupStore } from './store/useGroupStore';
import { useChatStore } from './store/useChatStore';
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { useResponsive } from './hooks/useResponsive';

const App = () => {
  const { authUser, checkAuth, isCheckingAuth, onlineUsers, socket } = useAuthStore();
  const { getMyGroups } = useGroupStore();
  const { getGroups, subscribeToMessages, unsubscribeFromMessages } = useChatStore();
  const { subscribeToFriendRequests, unsubscribeFromFriendRequests } = useFriendStore();
  const { theme } = useThemeStore();
  
  // Responsive data
  const { showMobileLayout } = useResponsive();

  useEffect(() => {
    if (authUser) {
      getMyGroups();
      getGroups();
    }
  }, [authUser, getMyGroups, getGroups]);

  useEffect(() => {
    if (authUser && socket) {
      if (socket.connected) {
        subscribeToMessages();
      } else {
        socket.on("connect", () => {
          subscribeToMessages();
        });
      }
      
      return () => {
        unsubscribeFromMessages();
      };
    }
  }, [authUser, socket?.connected, subscribeToMessages, unsubscribeFromMessages]); 

  useEffect(() => {
    if (authUser) {
      subscribeToFriendRequests();
      return () => {
        unsubscribeFromFriendRequests();
      };
    }
  }, [authUser, subscribeToFriendRequests, unsubscribeFromFriendRequests]);
  
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen bg-base-100">
        <Loader className="size-10 animate-spin text-primary" />
      </div>
    );

  // Calculate proper padding based on page and device
  const getMainPadding = () => {
    if (!authUser) return '';
    
    // HomePage gets special treatment
    if (location.pathname === '/') {
      return showMobileLayout ? 'pt-12' : 'pt-20'; // Minimal navbar height on mobile home
    }
    
    // Other pages get normal navbar height
    return showMobileLayout ? 'pt-16' : 'pt-20';
  };

  return (
    <div 
      data-theme={theme} 
      className={`min-h-screen bg-base-100 ${showMobileLayout ? 'overflow-x-hidden' : ''}`}
    >
      <ThemeProvider />
      
      {/* Always show navbar */}
      <Navbar />

      <div className={getMainPadding()}>
        <Routes>
          <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
          <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
          <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/friends" element={<FriendsPage />} />
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/" />} />
        </Routes>
      </div>

      <Toaster
        position={showMobileLayout ? "top-center" : "top-right"}
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--fallback-b1,oklch(var(--b1)))',
            color: 'var(--fallback-bc,oklch(var(--bc)))',
            border: '1px solid var(--fallback-b3,oklch(var(--b3)))',
            fontSize: showMobileLayout ? '14px' : '16px',
            padding: showMobileLayout ? '8px 12px' : '12px 16px',
          },
        }}
      />
    </div>
  );
};

export default App;