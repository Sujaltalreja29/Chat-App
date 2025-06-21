// src/App.jsx - Fixed with proper auth redirects and landing page routing
import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { Loader, MessageSquare } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import ThemeProvider from './components/ThemeProvider';

import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import FriendsPage from './pages/FriendsPage';
import GroupsPage from './pages/GroupsPage';
import LandingPage from "./pages/LandingPage";

import { useFriendStore } from './store/useFriendStore';
import { useGroupStore } from './store/useGroupStore';
import { useChatStore } from './store/useChatStore';
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { useResponsive } from './hooks/useResponsive';
import { GoogleOAuthProvider } from "@react-oauth/google";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth, onlineUsers, socket } = useAuthStore();
  const { getMyGroups } = useGroupStore();
  const { getGroups, subscribeToMessages, unsubscribeFromMessages } = useChatStore();
  const { subscribeToFriendRequests, unsubscribeFromFriendRequests } = useFriendStore();
  const { theme } = useThemeStore();
  const location = useLocation();
  
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
        <MessageSquare className="size-10 animate-pulse rounded-lg text-primary-content" />
      </div>
    );

  // Helper to determine if current page should show navbar
  const shouldShowNavbar = () => {
    const noNavbarPages = ['/landing'];
    return !noNavbarPages.includes(location.pathname);
  };

  // Get main content padding based on route and auth status
  const getMainPadding = () => {
    if (!authUser) return '';
    
    // HomePage gets NO padding - navbar will be absolute/fixed positioned
    if (location.pathname === '/') {
      return '';
    }
    
    // Other authenticated pages get normal navbar height
    return showMobileLayout ? 'pt-16' : 'pt-20';
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div 
        data-theme={theme} 
        className={`min-h-screen bg-base-100 ${showMobileLayout ? 'overflow-x-hidden' : ''}`}
      >
        <ThemeProvider />
        
        {/* Conditional Navbar rendering */}
        {shouldShowNavbar() && (
          <div className={location.pathname === '/' ? 'absolute top-0 left-0 right-0 z-50' : 'relative'}>
            <Navbar />
          </div>
        )}

        <div className={getMainPadding()}>
          <Routes>
            {/* 🆕 Landing page as default for non-authenticated users */}
            <Route 
              path="/landing" 
              element={!authUser ? <LandingPage /> : <Navigate to="/" />} 
            />
            
            {/* Auth pages */}
            <Route 
              path="/signup" 
              element={!authUser ? <SignUpPage /> : <Navigate to="/" />} 
            />
            <Route 
              path="/login" 
              element={!authUser ? <LoginPage /> : <Navigate to="/" />} 
            />
            
            {/* Protected routes - redirect to landing if not authenticated */}
            <Route 
              path="/" 
              element={authUser ? <HomePage /> : <Navigate to="/landing" />} 
            />
            <Route 
              path="/settings" 
              element={authUser ? <SettingsPage /> : <Navigate to="/landing" />} 
            />
            <Route 
              path="/friends" 
              element={authUser ? <FriendsPage /> : <Navigate to="/landing" />} 
            />
            <Route 
              path="/groups" 
              element={authUser ? <GroupsPage /> : <Navigate to="/landing" />} 
            />
            <Route 
              path="/profile" 
              element={authUser ? <ProfilePage /> : <Navigate to="/landing" />} 
            />
            
            {/* Catch all route - redirect based on auth status */}
            <Route 
              path="*" 
              element={<Navigate to={authUser ? "/" : "/landing"} replace />} 
            />
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
    </GoogleOAuthProvider>
  );
};

export default App;