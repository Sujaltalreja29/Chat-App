// pages/LoginPage.jsx - Fixed responsive layout
import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageCircle, ArrowRight, Users } from "lucide-react";
import { GoogleLogin } from '@react-oauth/google';
import toast from "react-hot-toast";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { login, loginWithGoogle, isLoggingIn } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    login(formData);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await loginWithGoogle(credentialResponse.credential);
      toast.success("Successfully logged in with Google!");
    } catch (error) {
      toast.error("Google login failed. Please try again.");
      console.error("Google login error:", error);
    }
  };

  const handleGoogleError = () => {
    toast.error("Google login failed. Please try again.");
  };

  return (
    <div className="min-h-screen bg-base-200">
      {/* Container with proper spacing */}
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <div className="flex items-center justify-center min-h-full">
          <div className="w-full max-w-6xl grid lg:grid-cols-5 gap-8 lg:gap-12 items-center">
            
            {/* Left Side - Chat App Showcase */}
            <div className="hidden lg:block lg:col-span-3 space-y-8">
              {/* App Branding */}
              <div className="text-center space-y-6">
                <div>
                  <h1 className="text-4xl xl:text-5xl font-bold text-base-content mb-4">
                    Welcome back to{" "}
                    <span className="text-primary">Chatty</span>
                  </h1>
                  <p className="text-lg xl:text-xl text-base-content/70 max-w-lg mx-auto">
                    Your conversations are waiting. Connect with friends and stay in touch.
                  </p>
                </div>
              </div>

              {/* Chat Preview Card */}
              <div className="max-w-md mx-auto">
                <div className="card bg-base-100 shadow-xl border border-base-300">
                  <div className="card-body p-0">
                    {/* Chat Header */}
                    <div className="flex items-center gap-3 p-4 bg-primary text-primary-content rounded-t-2xl">
                      <div className="avatar online">
                        <div className="w-10 rounded-full">
                          <img src="/avatar.png" alt="Sarah" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold">Sarah Wilson</h3>
                        <p className="text-sm opacity-90">Online now</p>
                      </div>
                    </div>
                    
                    {/* Chat Messages */}
                    <div className="p-4 space-y-4 bg-base-100">
                      <div className="chat chat-start">
                        <div className="chat-bubble chat-bubble-primary text-sm">
                          Hey! How are you? 👋
                        </div>
                      </div>
                      <div className="chat chat-end">
                        <div className="chat-bubble text-sm">
                          I'm great! Just got back from vacation 🏖️
                        </div>
                      </div>
                      <div className="chat chat-start">
                        <div className="chat-bubble chat-bubble-primary text-sm">
                          That sounds amazing!
                        </div>
                      </div>
                      <div className="chat chat-end">
                        <div className="chat-bubble text-sm">
                          Want to catch up over coffee? ☕
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <div className="flex items-center gap-3 p-3 bg-base-100 rounded-lg shadow-sm border border-base-300">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium">Real-time Chat</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-base-100 rounded-lg shadow-sm border border-base-300">
                  <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-secondary" />
                  </div>
                  <span className="text-sm font-medium">Group Chats</span>
                </div>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="lg:col-span-2 w-full max-w-md mx-auto pt-20 lg:mx-0">
              <div className="card bg-base-100 shadow-xl border border-base-300">
                <div className="card-body p-6 sm:p-8">
                  
                  {/* Form Header */}
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Lock className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-base-content mb-2">
                      Sign In
                    </h2>
                    <p className="text-base-content/70">
                      Continue your conversations
                    </p>
                  </div>

                  {/* Google Login Button */}
                  <div className="mb-6">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      size="large"
                      width="100%"
                      text="signin_with"
                      shape="rectangular"
                      logo_alignment="left"
                    />
                  </div>

                  {/* Divider */}
                  <div className="divider my-6 text-base-content/50">or continue with email</div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email Input */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">Email address</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-base-content/40" />
                        <input
                          type="email"
                          required
                          className="input input-bordered w-full pl-10 focus:input-primary"
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">Password</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-base-content/40" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          className="input input-bordered w-full pl-10 pr-10 focus:input-primary"
                          placeholder="Enter your password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 btn btn-ghost btn-sm btn-circle"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isLoggingIn}
                      className="btn btn-primary w-full gap-2"
                    >
                      {isLoggingIn ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        <>
                          Sign In
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </form>

                  {/* Footer */}
                  <div className="text-center mt-6">
                    <p className="text-base-content/70">
                      New to Chatty?{" "}
                      <Link
                        to="/signup"
                        className="link link-primary font-medium"
                      >
                        Create an account
                      </Link>
                    </p>
                  </div>
                </div>
              </div>

              {/* Mobile Features - Only show on smaller screens */}
              <div className="lg:hidden mt-6 text-center">
                <h3 className="text-lg font-semibold mb-3 text-base-content">Connect & Chat Instantly</h3>
                <div className="flex justify-center gap-6">
                  <div className="flex items-center gap-2 text-sm text-base-content/70">
                    <MessageCircle className="w-4 h-4 text-primary" />
                    <span>Real-time</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-base-content/70">
                    <Users className="w-4 h-4 text-secondary" />
                    <span>Groups</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;