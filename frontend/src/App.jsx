import Navbar from "./components/Navbar";

import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import FriendsPage from './pages/FriendsPage';
import GroupsPage from './pages/GroupsPage';

import { Routes, Route, Navigate } from "react-router-dom";
import { useFriendStore } from './store/useFriendStore';
import { useGroupStore } from './store/useGroupStore';
import { useChatStore } from './store/useChatStore';
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { useEffect } from "react";
import ThemeProvider from './components/ThemeProvider';
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth, onlineUsers } = useAuthStore();
  const { getMyGroups } = useGroupStore();
  const { getGroups } = useChatStore();
  const { subscribeToFriendRequests, unsubscribeFromFriendRequests } = useFriendStore();
  const { theme } = useThemeStore();

  console.log({ onlineUsers });

    useEffect(() => {
    if (authUser) {
      getMyGroups();
      getGroups();
    }
  }, [authUser, getMyGroups, getGroups]);

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

  console.log({ authUser });

  useEffect(() => {
    // Apply theme on app initialization
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  return (
    <div data-theme={theme}>
      <ThemeProvider />
      <Navbar />

      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/friends" element={<FriendsPage />} />
        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
      </Routes>

      <Toaster />
    </div>
  );
};
export default App;
