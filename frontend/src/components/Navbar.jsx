// Update your existing Navbar.jsx to include friend requests
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useFriendStore } from "../store/useFriendStore";
import { LogOut, MessageSquare, Settings, User, Bell, Search, Users } from "lucide-react";
import { useEffect } from "react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const { pendingRequests, getPendingRequests } = useFriendStore();

  useEffect(() => {
    if (authUser) {
      getPendingRequests();
    }
  }, [authUser, getPendingRequests]);

  const totalRequests = pendingRequests.received?.length || 0;

  return (
    <header className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-50 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity duration-200">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-content flex items-center justify-center shadow-sm">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="text-xl font-semibold text-base-content">Chatty</span>
          </Link>

          {/* Search Bar */}
          {/* {authUser && (
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <input
                type="text"
                placeholder="Search conversations..."
                className="input input-bordered w-full"
              />
            </div>
          )} */}

          {/* Actions */}
          <div className="flex items-center gap-2">
            {authUser ? (
              <>
                {/* Mobile Search */}
                <button className="md:hidden btn btn-ghost btn-circle">
                  <Search className="w-5 h-5" />
                </button>

                {/* Friends Page */}
                <Link to="/friends" className="btn btn-ghost relative">
                  <Users className="w-5 h-5" />
                  <span className="hidden sm:inline">Friends</span>
                  {totalRequests > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-error text-error-content rounded-full text-xs flex items-center justify-center font-bold">
                      {totalRequests}
                    </div>
                  )}
                </Link>

                {/* Notifications */}
                {/* <button className="btn btn-ghost btn-circle relative">
                  <Bell className="w-5 h-5" />
                  {totalRequests > 0 && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-error rounded-full"></div>
                  )}
                </button> */}

                {/* Settings */}
                <Link to="/settings" className="btn btn-ghost">
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Settings</span>
                </Link>

                {/* Profile */}
                <Link to="/profile" className="btn btn-ghost">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Profile</span>
                </Link>

                {/* User Avatar & Logout */}
                <div className="flex items-center gap-3 ml-2">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-content flex items-center justify-center text-sm font-medium shadow-sm">
                    {authUser.fullName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  
                  <button
                    onClick={logout}
                    className="btn btn-ghost text-error"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="btn btn-ghost">Sign in</Link>
                <Link to="/signup" className="btn btn-primary">Get Started</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {authUser && (
        <div className="md:hidden px-4 pb-3 border-t border-base-300">
          <input
            type="text"
            placeholder="Search conversations..."
            className="input input-bordered input-sm w-full"
          />
        </div>
      )}
    </header>
  );
};

export default Navbar;