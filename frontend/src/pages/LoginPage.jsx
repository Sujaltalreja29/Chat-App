// pages/LoginPage.jsx - DaisyUI Themed Chat Design
import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageCircle, ArrowRight, Users } from "lucide-react";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { login, isLoggingIn } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    login(formData);
  };

  return (
    <div className="min-h-screen bg-base-200">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side - Chat App Showcase */}
          <div className="hidden lg:block space-y-8">
            {/* App Branding */}
            <div className="text-center space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-base-content mb-3 ">
                  Welcome back to{" "}
                  <span className="text-primary">Chatty</span>
                </h1>
                <p className="text-lg text-base-content/70 max-w-md mx-auto">
                  Your conversations are waiting. Connect with friends and stay in touch.
                </p>
              </div>
            </div>

            {/* Chat Preview Card */}
            <div className="max-w-sm mx-auto">
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
                  <div className="p-4 space-y-3 bg-base-100">
                    <div className="chat chat-start">
                      <div className="chat-bubble chat-bubble-primary">
                        Hey! How are you? 👋
                      </div>
                    </div>
                    <div className="chat chat-end">
                      <div className="chat-bubble">
                        I'm great! Just got back from vacation 🏖️
                      </div>
                    </div>
                    <div className="chat chat-start">
                      <div className="chat-bubble chat-bubble-primary">
                        That sounds amazing!
                      </div>
                    </div>
                    <div className="chat chat-end">
                      <div className="chat-bubble">
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
          <div className="w-full max-w-md mx-auto">
            <div className="card bg-base-100 shadow-xl border border-base-300">
              <div className="card-body p-8">
                
                {/* Form Header */}
                <div className="text-center mb-8">
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

                {/* Divider */}
                <div className="divider my-6 text-base-content/50">or</div>

                {/* Footer */}
                <div className="text-center">
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

            {/* Mobile Features */}
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
  );
};

export default LoginPage;