// pages/SignUpPage.jsx - Responsive with Google Auth
import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Eye, EyeOff, Loader2, Lock, Mail, User, ArrowRight, MessageCircle, Users, Hash } from "lucide-react";
import { Link } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google';
import toast from "react-hot-toast";

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const { signup, signupWithGoogle, isSigningUp } = useAuthStore();

  const validateForm = () => {
    if (!formData.fullName.trim()) return toast.error("Full name is required");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");
    if (!formData.password) return toast.error("Password is required");
    if (formData.password.length < 6) return toast.error("Password must be at least 6 characters");

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = validateForm();
    if (success === true) signup(formData);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await signupWithGoogle(credentialResponse.credential);
      toast.success("Successfully signed up with Google!");
    } catch (error) {
      toast.error("Google signup failed. Please try again.");
      console.error("Google signup error:", error);
    }
  };

  const handleGoogleError = () => {
    toast.error("Google signup failed. Please try again.");
  };

  return (
    <div className="min-h-screen bg-base-200">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Left Side - Community Showcase */}
          <div className="hidden lg:block space-y-6 xl:space-y-8">
            {/* Community Branding */}
            <div className="text-center space-y-4 xl:space-y-6">
              <div className="flex items-center justify-center">
                <div className="w-12 h-12 xl:w-16 xl:h-16 bg-secondary rounded-2xl flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 xl:w-8 xl:h-8 text-secondary-content" />
                </div>
              </div>
              
              <div>
                <h1 className="text-3xl xl:text-4xl font-bold text-base-content mb-3">
                  Join the{" "}
                  <span className="text-secondary">Community</span>
                </h1>
                <p className="text-base xl:text-lg text-base-content/70 max-w-md mx-auto">
                  Connect with millions of users worldwide. Start meaningful conversations today.
                </p>
              </div>
            </div>

            {/* Community Stats */}
            {/* <div className="grid grid-cols-3 gap-2 xl:gap-4 max-w-md mx-auto">
              <div className="stats shadow border border-base-300">
                <div className="stat place-items-center py-3 xl:py-4">
                  <div className="stat-value text-primary text-base xl:text-lg">1M+</div>
                  <div className="stat-desc text-xs xl:text-sm">Users</div>
                </div>
              </div>
              <div className="stats shadow border border-base-300">
                <div className="stat place-items-center py-3 xl:py-4">
                  <div className="stat-value text-secondary text-base xl:text-lg">50K+</div>
                  <div className="stat-desc text-xs xl:text-sm">Daily Chats</div>
                </div>
              </div>
              <div className="stats shadow border border-base-300">
                <div className="stat place-items-center py-3 xl:py-4">
                  <div className="stat-value text-accent text-base xl:text-lg">99.9%</div>
                  <div className="stat-desc text-xs xl:text-sm">Uptime</div>
                </div>
              </div>
            </div> */}

            {/* Group Chat Preview */}
            <div className="max-w-sm mx-auto relative">
              <div className="card bg-base-100 shadow-xl border border-base-300">
                <div className="card-body p-3 xl:p-4">
                  <div className="flex items-center justify-between mb-3 xl:mb-4">
                    <h3 className="font-bold flex items-center gap-2 text-sm xl:text-base">
                      <Hash className="w-3 h-3 xl:w-4 xl:h-4 text-primary" />
                      Design Team
                    </h3>
                    <div className="badge badge-success gap-1 text-xs">
                      <div className="w-1.5 h-1.5 xl:w-2 xl:h-2 bg-success-content rounded-full"></div>
                      5 online
                    </div>
                  </div>
                  
                  <div className="space-y-2 xl:space-y-3">
                    <div className="chat chat-start">
                      <div className="chat-image avatar">
                        <div className="w-5 h-5 xl:w-6 xl:h-6 rounded-full">
                          <img src="/avatar.png" alt="User" />
                        </div>
                      </div>
                      <div className="chat-bubble chat-bubble-primary text-xs xl:text-sm">
                        Welcome to the team! 🎉
                      </div>
                    </div>
                    
                    <div className="chat chat-end">
                      <div className="chat-bubble text-xs xl:text-sm">
                        Thank you! Excited to be here 🚀
                      </div>
                    </div>
                    
                    <div className="chat chat-start">
                      <div className="chat-image avatar">
                        <div className="w-5 h-5 xl:w-6 xl:h-6 rounded-full bg-secondary text-secondary-content flex items-center justify-center text-xs font-bold">
                          A
                        </div>
                      </div>
                      <div className="chat-bubble chat-bubble-secondary text-xs xl:text-sm">
                        Let's create something amazing! ✨
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notification Badge */}
              <div className="absolute -top-2 -right-2">
                <div className="badge badge-error gap-1 text-xs">
                  <span>3</span>
                </div>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-2 gap-3 xl:gap-4 max-w-md mx-auto">
              <div className="flex items-center gap-2 xl:gap-3 p-2 xl:p-3 bg-base-100 rounded-lg shadow-sm border border-base-300">
                <div className="w-6 h-6 xl:w-8 xl:h-8 bg-success/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-3 h-3 xl:w-4 xl:h-4 text-success" />
                </div>
                <span className="text-xs xl:text-sm font-medium">Instant Setup</span>
              </div>
              <div className="flex items-center gap-2 xl:gap-3 p-2 xl:p-3 bg-base-100 rounded-lg shadow-sm border border-base-300">
                <div className="w-6 h-6 xl:w-8 xl:h-8 bg-info/20 rounded-full flex items-center justify-center">
                  <Hash className="w-3 h-3 xl:w-4 xl:h-4 text-info" />
                </div>
                <span className="text-xs xl:text-sm font-medium">Group Chats</span>
              </div>
            </div>
          </div>

          {/* Right Side - Signup Form */}
          <div className="w-full max-w-md mx-auto mt-20">
            <div className="card bg-base-100 shadow-xl border border-base-300">
              <div className="card-body p-6 sm:p-8">
                
                {/* Form Header */}
                <div className="text-center mb-6 sm:mb-8">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-secondary" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-base-content mb-2">
                    Create Account
                  </h2>
                  <p className="text-sm sm:text-base text-base-content/70">
                    Join our community today
                  </p>
                </div>

                {/* Google Signup Button */}
                <div className="mb-6">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    size="large"
                    width="100%"
                    text="signup_with"
                    shape="rectangular"
                    logo_alignment="left"
                  />
                </div>

                {/* Divider */}
                <div className="divider my-4 sm:my-6 text-base-content/50">or continue with email</div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  {/* Full Name Input */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium text-sm sm:text-base">Full Name</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-base-content/40" />
                      <input
                        type="text"
                        required
                        className="input input-bordered w-full pl-10 focus:input-secondary text-sm sm:text-base"
                        placeholder="Enter your full name"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Email Input */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium text-sm sm:text-base">Email address</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-base-content/40" />
                      <input
                        type="email"
                        required
                        className="input input-bordered w-full pl-10 focus:input-secondary text-sm sm:text-base"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium text-sm sm:text-base">Password</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-base-content/40" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        className="input input-bordered w-full pl-10 pr-10 focus:input-secondary text-sm sm:text-base"
                        placeholder="Create a password (min. 6 characters)"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 btn btn-ghost btn-sm btn-circle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" /> : <Eye className="h-3 w-3 sm:h-4 sm:w-4" />}
                      </button>
                    </div>
                    <label className="label">
                      <span className="label-text-alt text-xs sm:text-sm text-base-content/60">
                        Must be at least 6 characters long
                      </span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSigningUp}
                    className="btn btn-secondary w-full gap-2 text-sm sm:text-base"
                  >
                    {isSigningUp ? (
                      <>
                        <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Footer */}
                <div className="text-center space-y-3 sm:space-y-4 mt-6">
                  <p className="text-sm sm:text-base text-base-content/70">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="link link-secondary font-medium"
                    >
                      Sign in
                    </Link>
                  </p>
                  
                  {/* Terms */}
                  <p className="text-xs text-base-content/60">
                    By creating an account, you agree to our{" "}
                    <a href="#" className="link link-secondary">Terms of Service</a> and{" "}
                    <a href="#" className="link link-secondary">Privacy Policy</a>
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile Features */}
            <div className="lg:hidden mt-6 text-center">
              <h3 className="text-base sm:text-lg font-semibold mb-3 text-base-content">Join the Community</h3>
              <div className="flex justify-center gap-4 sm:gap-6">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-base-content/70">
                  <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                  <span>Chat</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-base-content/70">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 text-secondary" />
                  <span>Groups</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-base-content/70">
                  <Hash className="w-3 h-3 sm:w-4 sm:h-4 text-accent" />
                  <span>Channels</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;