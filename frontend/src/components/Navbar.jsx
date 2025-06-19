// src/components/Navbar.jsx - Fixed mobile navbar
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useFriendStore } from "../store/useFriendStore";
import { useResponsive } from "../hooks/useResponsive";
import { 
  LogOut, MessageSquare, Settings, User, Bell, Search, 
  Users, Hash, Menu, X, ArrowLeft 
} from "lucide-react";
import { useEffect, useState } from "react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const { pendingRequests, getPendingRequests } = useFriendStore();
  const { isMobile, isTablet, showMobileLayout } = useResponsive();
  const location = useLocation();
  
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  
  const totalRequests = pendingRequests.received?.length || 0;
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    if (authUser) {
      getPendingRequests();
    }
  }, [authUser, getPendingRequests]);

  // Close mobile menu when route changes
  useEffect(() => {
    setShowMobileMenu(false);
    setShowMobileSearch(false);
  }, [location.pathname]);

  // Don't hide navbar completely on mobile home page - show it but make it minimal
  const shouldShowMinimalNavbar = showMobileLayout && isHomePage;

  return (
    <header className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-navbar backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between ${
          shouldShowMinimalNavbar ? 'h-12' : 'h-16'
        }`}>
          
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-3 hover:opacity-80 transition-opacity duration-200"
          >
            <div className={`rounded-lg bg-primary text-primary-content flex items-center justify-center shadow-sm ${
              shouldShowMinimalNavbar ? 'w-6 h-6' : 'w-8 h-8'
            }`}>
              <MessageSquare className={`${shouldShowMinimalNavbar ? 'w-3 h-3' : 'w-5 h-5'}`} />
            </div>
            {!shouldShowMinimalNavbar && (
              <span className={`text-xl font-semibold text-base-content ${
                isMobile ? 'hidden xs:block' : ''
              }`}>
                Chatty
              </span>
            )}
          </Link>

          {/* Desktop Search Bar */}
          {/* {authUser && !showMobileLayout && (
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/60 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="input input-bordered w-full pl-10 pr-4"
                />
              </div>
            </div>
          )} */}

          {/* Desktop Actions */}
          {!showMobileLayout && (
            <div className="flex items-center gap-2">
              {authUser ? (
                <>
                  <Link 
                    to="/groups" 
                    className={`btn btn-ghost ${
                      location.pathname === '/groups' ? 'btn-active' : ''
                    }`}
                  >
                    <Hash className="w-4 h-4" />
                    <span className="hidden lg:inline">Groups</span>
                  </Link>
                  
                  <Link 
                    to="/friends" 
                    className={`btn btn-ghost relative ${
                      location.pathname === '/friends' ? 'btn-active' : ''
                    }`}
                  >
                    <Users className="w-5 h-5" />
                    <span className="hidden lg:inline">Friends</span>
                    {totalRequests > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-error text-error-content rounded-full text-xs flex items-center justify-center font-bold">
                        {totalRequests}
                      </div>
                    )}
                  </Link>

                  <Link 
                    to="/settings" 
                    className={`btn btn-ghost ${
                      location.pathname === '/settings' ? 'btn-active' : ''
                    }`}
                  >
                    <Settings className="w-4 h-4" />
                    <span className="hidden lg:inline">Settings</span>
                  </Link>

                  <Link 
                    to="/profile" 
                    className={`btn btn-ghost ${
                      location.pathname === '/profile' ? 'btn-active' : ''
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden lg:inline">Profile</span>
                  </Link>

                  <div className="flex items-center gap-3 ml-2">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-content flex items-center justify-center text-sm font-medium shadow-sm">
                      {authUser.fullName?.charAt(0).toUpperCase() || 'U'}
                    </div>

                    <button
                      onClick={logout}
                      className="btn btn-ghost text-error hover:bg-error/10"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="hidden xl:inline">Logout</span>
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
          )}

          {/* Mobile Actions */}
          {showMobileLayout && authUser && (
            <div className="flex items-center gap-1">
              {/* Mobile Search Toggle - Hide on minimal navbar */}
              {!shouldShowMinimalNavbar && (
                <button
                  onClick={() => setShowMobileSearch(!showMobileSearch)}
                  className={`btn btn-ghost btn-circle btn-sm ${showMobileSearch ? 'btn-active' : ''}`}
                >
                  {showMobileSearch ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
                </button>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className={`btn btn-ghost btn-circle ${shouldShowMinimalNavbar ? 'btn-xs' : 'btn-sm'} ${showMobileMenu ? 'btn-active' : ''}`}
              >
                {showMobileMenu ? (
                  <X className={`${shouldShowMinimalNavbar ? 'w-3 h-3' : 'w-4 h-4'}`} />
                ) : (
                  <Menu className={`${shouldShowMinimalNavbar ? 'w-3 h-3' : 'w-4 h-4'}`} />
                )}
              </button>
            </div>
          )}

          {/* Mobile Sign In/Up */}
          {showMobileLayout && !authUser && (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn btn-ghost btn-sm">Sign in</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Sign up</Link>
            </div>
          )}
        </div>

        {/* Mobile Search Bar */}
        {/* {showMobileLayout && authUser && showMobileSearch && !shouldShowMinimalNavbar && (
          <div className="pb-3 border-t border-base-300 mt-3 pt-3 animate-slide-in-left">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/60 w-4 h-4" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="input input-bordered input-sm w-full pl-10 pr-4 input-mobile"
                autoFocus
              />
            </div>
          </div>
        )} */}
      </div>

      {/* Mobile Menu Dropdown */}
      {showMobileLayout && authUser && showMobileMenu && (
        <div className="absolute top-full left-0 right-0 bg-base-100 border-b border-base-300 shadow-lg animate-slide-in-left z-dropdown">
          <div className="max-w-7xl mx-auto px-4 py-4">
            {/* User Info */}
            <div className="flex items-center gap-3 mb-4 p-3 bg-base-200 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-content flex items-center justify-center text-sm font-medium shadow-sm">
                {authUser.fullName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-base-content truncate">
                  {authUser.fullName}
                </div>
                <div className="text-sm text-base-content/60 truncate">
                  {authUser.email}
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="space-y-2">
              <Link
                to="/groups"
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors relative ${
                  location.pathname === '/groups' 
                    ? 'bg-primary text-primary-content' 
                    : 'hover:bg-base-200'
                }`}
              >
                <Hash className="w-5 h-5" />
                <span className="font-medium">Groups</span>
              </Link>

              <Link
                to="/friends"
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors relative ${
                  location.pathname === '/friends' 
                    ? 'bg-primary text-primary-content' 
                    : 'hover:bg-base-200'
                }`}
              >
                <Users className="w-5 h-5" />
                <span className="font-medium">Friends</span>
                {totalRequests > 0 && (
                  <div className="ml-auto w-6 h-6 bg-error text-error-content rounded-full text-xs flex items-center justify-center font-bold">
                    {totalRequests}
                  </div>
                )}
              </Link>

              <Link
                to="/settings"
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  location.pathname === '/settings' 
                    ? 'bg-primary text-primary-content' 
                    : 'hover:bg-base-200'
                }`}
              >
                <Settings className="w-5 h-5" />
                <span className="font-medium">Settings</span>
              </Link>

              <Link
                to="/profile"
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  location.pathname === '/profile' 
                    ? 'bg-primary text-primary-content' 
                    : 'hover:bg-base-200'
                }`}
              >
                <User className="w-5 h-5" />
                <span className="font-medium">Profile</span>
              </Link>

              {/* Logout */}
              <button
                onClick={logout}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-error/10 text-error transition-colors w-full"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {showMobileLayout && (showMobileMenu || showMobileSearch) && (
        <div
          className="fixed inset-0 bg-black/20 z-overlay top-16"
          onClick={() => {
            setShowMobileMenu(false);
            setShowMobileSearch(false);
          }}
        />
      )}
    </header>
  );
};

export default Navbar;