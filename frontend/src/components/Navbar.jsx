import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, MessageSquare, Settings, User, Bell, Search } from "lucide-react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();

  return (
    // Replace custom classes with DaisyUI semantic classes
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
      {authUser && (
        <div className="hidden md:flex flex-1 max-w-lg mx-8">
          <input
            type="text"
            placeholder="Search conversations..."
            className="input input-bordered w-full"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        {authUser ? (
          <>
            <button className="btn btn-ghost btn-circle">
              <Search className="w-5 h-5" />
            </button>
            <button className="btn btn-ghost btn-circle">
              <Bell className="w-5 h-5" />
            </button>
            <Link to="/settings" className="btn btn-ghost">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>
            <Link to="/profile" className="btn btn-ghost">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </Link>
            <button onClick={logout} className="btn btn-ghost text-error">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
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
</header>
  );
};

export default Navbar;