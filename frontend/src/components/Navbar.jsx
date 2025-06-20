// src/components/Navbar.jsx - Enhanced with Avatar Dropdown
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useFriendStore } from "../store/useFriendStore";
import { useResponsive } from "../hooks/useResponsive";
import { 
  LogOut, MessageSquare, Settings, User, Users, Hash, Menu, X, ChevronDown
} from "lucide-react";
import { useEffect, useState, useRef } from "react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const { pendingRequests, getPendingRequests } = useFriendStore();
  const { isMobile, isTablet, showMobileLayout } = useResponsive();
  const location = useLocation();
  
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showAvatarDropdown, setShowAvatarDropdown] = useState(false);
  const dropdownRef = useRef(null);
  
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
    setShowAvatarDropdown(false);
  }, [location.pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowAvatarDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const shouldShowMinimalNavbar = showMobileLayout && isHomePage;

  return (
    <header className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-navbar backdrop-blur-lg py-2">
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

          {/* Desktop Navigation & Actions */}
          {!showMobileLayout && (
            <div className="flex items-center gap-6">
              {authUser ? (
                <>
                  {/* Navigation Links */}
                  <nav className="flex items-center gap-1">
                    <Link 
                      to="/groups" 
                      className={`btn btn-ghost ${
                        location.pathname === '/groups' ? 'btn-active' : ''
                      }`}
                    >
                      <Hash className="w-4 h-4" />
                      <span className="hidden lg:inline ml-2">Groups</span>
                    </Link>
                    
                    <Link 
                      to="/friends" 
                      className={`btn btn-ghost relative ${
                        location.pathname === '/friends' ? 'btn-active' : ''
                      }`}
                    >
                      <Users className="w-5 h-5" />
                      <span className="hidden lg:inline ml-2">Friends</span>
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
                      <span className="hidden lg:inline ml-2">Settings</span>
                    </Link>
                  </nav>

                  {/* Avatar Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setShowAvatarDropdown(!showAvatarDropdown)}
                      className="flex items-center gap-2 btn btn-ghost hover:bg-base-200 transition-colors"
                    >
                      <div className="avatar">
                        <div className="w-8 h-8 rounded-full ring ring-base-300 ring-offset-2 ring-offset-base-100">
                          {authUser.profilePic ? (
                            <img 
                              src={authUser.profilePic} 
                              alt={authUser.fullName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-primary text-primary-content flex items-center justify-center text-sm font-medium">
                              {authUser.fullName?.charAt(0).toUpperCase() || 'U'}
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="hidden xl:inline font-medium text-base-content">
                        {authUser.fullName?.split(' ')[0] || 'User'}
                      </span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${
                        showAvatarDropdown ? 'rotate-180' : ''
                      }`} />
                    </button>

                    {/* Desktop Avatar Dropdown */}
                    {showAvatarDropdown && (
                      <div className="absolute right-0 top-full mt-2 w-64 bg-base-100 rounded-lg shadow-lg border border-base-300 py-2 z-dropdown animate-fade-in-up">
                        {/* User Info */}
                        <div className="px-4 py-3 border-b border-base-200">
                          <div className="flex items-center gap-3">
                            <div className="avatar">
                              <div className="w-10 h-10 rounded-full ring ring-base-300 ring-offset-1 ring-offset-base-100">
                                {authUser.profilePic ? (
                                  <img 
                                    src={authUser.profilePic} 
                                    alt={authUser.fullName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-primary text-primary-content flex items-center justify-center text-sm font-medium">
                                    {authUser.fullName?.charAt(0).toUpperCase() || 'U'}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-base-content truncate">
                                {authUser.fullName}
                              </div>
                              <div className="text-sm text-base-content/70 truncate">
                                {authUser.email}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                          <Link
                            to="/profile"
                            onClick={() => setShowAvatarDropdown(false)}
                            className={`flex items-center gap-3 px-4 py-2 hover:bg-base-200 transition-colors ${
                              location.pathname === '/profile' ? 'bg-primary/10 text-primary' : 'text-base-content'
                            }`}
                          >
                            <User className="w-4 h-4" />
                            <span className="font-medium">Profile</span>
                          </Link>

                          <div className="divider my-2 mx-4"></div>

                          <button
                            onClick={() => {
                              logout();
                              setShowAvatarDropdown(false);
                            }}
                            className="flex items-center gap-3 px-4 py-2 hover:bg-error/10 text-error transition-colors w-full"
                          >
                            <LogOut className="w-4 h-4" />
                            <span className="font-medium">Sign out</span>
                          </button>
                        </div>
                      </div>
                    )}
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
            <div className="flex items-center gap-2">
              {/* Mobile Avatar (Quick Access) */}
              {!shouldShowMinimalNavbar && (
                <div className="avatar">
                  <div className="w-8 h-8 rounded-full ring ring-base-300 ring-offset-1 ring-offset-base-100">
                    {authUser.profilePic ? (
                      <img 
                        src={authUser.profilePic} 
                        alt={authUser.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary text-primary-content flex items-center justify-center text-xs font-medium">
                        {authUser.fullName?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                </div>
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
      </div>

      {/* Mobile Menu Dropdown */}
      {showMobileLayout && authUser && showMobileMenu && (
        <div className="absolute top-full left-0 right-0 bg-base-100 border-b border-base-300 shadow-lg animate-slide-in-top z-dropdown">
          <div className="max-w-7xl mx-auto px-4 py-4">
            {/* User Info */}
            <div className="flex items-center gap-3 mb-4 p-3 bg-base-200 rounded-lg">
              <div className="avatar">
                <div className="w-12 h-12 rounded-full ring ring-base-300 ring-offset-2 ring-offset-base-200">
                  {authUser.profilePic ? (
                    <img 
                      src={authUser.profilePic} 
                      alt={authUser.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary text-primary-content flex items-center justify-center text-sm font-medium">
                      {authUser.fullName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-base-content truncate">
                  {authUser.fullName}
                </div>
                <div className="text-sm text-base-content/70 truncate">
                  {authUser.email}
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="space-y-1">
              <Link
                to="/groups"
                onClick={() => setShowMobileMenu(false)}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
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
                onClick={() => setShowMobileMenu(false)}
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
                onClick={() => setShowMobileMenu(false)}
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
                onClick={() => setShowMobileMenu(false)}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  location.pathname === '/profile' 
                    ? 'bg-primary text-primary-content' 
                    : 'hover:bg-base-200'
                }`}
              >
                <User className="w-5 h-5" />
                <span className="font-medium">Profile</span>
              </Link>

              {/* Divider */}
              <div className="divider my-2"></div>

              {/* Logout */}
              <button
                onClick={() => {
                  logout();
                  setShowMobileMenu(false);
                }}
                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-error/10 text-error transition-colors w-full"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sign out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {showMobileLayout && (showMobileMenu || showAvatarDropdown) && (
        <div
          className="fixed inset-0 bg-black/20 z-overlay top-16"
          onClick={() => {
            setShowMobileMenu(false);
            setShowAvatarDropdown(false);
          }}
        />
      )}
    </header>
  );
};

export default Navbar;