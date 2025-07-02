// pages/LandingPage.jsx - Updated with proper spacing and mobile responsiveness
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  MessageCircle, 
  Users, 
  Zap, 
  Shield, 
  Globe, 
  Star,
  ArrowRight,
  Play,
  Check,
  Hash,
  FileText,
  Mic,
  Search,
  Smartphone,
  Monitor,
  Tablet,
  ChevronDown,
  Quote
} from "lucide-react";

const LandingPage = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: MessageCircle,
      title: "Real-time Messaging",
      description: "Instant messages with lightning-fast delivery and read receipts",
      color: "text-primary"
    },
    {
      icon: Users,
      title: "Group Conversations",
      description: "Create and manage group chats with friends, family, and teams",
      color: "text-secondary"
    },
    {
      icon: FileText,
      title: "File Sharing",
      description: "Share images, documents, videos, and more with ease",
      color: "text-accent"
    },
    {
      icon: Mic,
      title: "Voice Messages",
      description: "Send high-quality voice messages with waveform visualization",
      color: "text-success"
    },
    {
      icon: Search,
      title: "Smart Search",
      description: "Find any message or file instantly with our advanced search",
      color: "text-info"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "End-to-end encryption keeps your conversations safe",
      color: "text-warning"
    }
  ];

  const stats = [
    { number: "1M+", label: "Active Users", icon: Users },
    { number: "10M+", label: "Messages Sent", icon: MessageCircle },
    { number: "99.9%", label: "Uptime", icon: Zap },
    { number: "150+", label: "Countries", icon: Globe }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Product Manager",
      avatar: "/avatar1.png",
      content: "Chatty has revolutionized how our team communicates. The file sharing and voice messages are game-changers!",
      rating: 5
    },
    {
      name: "Mike Chen",
      role: "Startup Founder",
      avatar: "/avatar2.png",
      content: "The best chat app I've used. Clean interface, fast performance, and amazing features. Highly recommended!",
      rating: 5
    },
    {
      name: "Emily Davis",
      role: "Designer",
      avatar: "/avatar3.png",
      content: "Love the search functionality and group management. Makes staying connected with my team so much easier.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-base-100">
      {/* Hero Section - Added proper top padding to account for fixed navbar */}
      <section className="min-h-screen bg-gradient-to-br from-base-200 to-base-300 pt-20 md:pt-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="w-full max-w-6xl mx-auto">
            <div className="text-center space-y-6 md:space-y-8 lg:space-y-10 mb-12" >
              {/* Main Heading - Improved mobile responsiveness */}
              <div className="space-y-4 pt-12">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl font-bold text-base-content leading-tight">
                  <span className="block">Connect, Chat, and</span>
                  <span className="text-primary block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Collaborate
                  </span>
                </h1>
              </div>

              {/* Subtitle - Better mobile spacing */}
              <div className="max-w-3xl mx-auto px-4">
                <p className="text-lg sm:text-xl md:text-2xl text-base-content/80 leading-relaxed">
                  The modern messaging platform that brings people together. 
                  Fast, secure, and feature-rich communication for everyone.
                </p>
              </div>

              {/* CTA Buttons - Improved mobile layout */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6 md:pt-8">
                <Link 
                  to="/signup" 
                  className="btn btn-primary btn-lg gap-2 rounded-full text-base md:text-lg px-8 py-4 h-auto min-h-[3.5rem] shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  Start Chatting
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>

              {/* Demo Preview - Enhanced mobile responsiveness */}
              <div className="pt-8 md:pt-12 lg:pt-16">
                <div className="mockup-browser border border-base-300 bg-base-100 shadow-2xl max-w-5xl mx-auto transform hover:scale-105 transition-transform duration-500">
                  <div className="mockup-browser-toolbar">
                    <div className="input text-sm md:text-base">https://chatty.com</div>
                  </div>
                  <div className="bg-base-200 p-4 md:p-6 lg:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                      {/* Chat Preview */}
                      <div className="lg:col-span-2">
                        <div className="card bg-base-100 shadow-lg">
                          <div className="card-body p-3 md:p-4 lg:p-6">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="avatar online">
                                <div className="w-8 md:w-10 lg:w-12 rounded-full">
                                  <img src="/avatar.png" alt="User" />
                                </div>
                              </div>
                              <div>
                                <h3 className="font-semibold text-sm md:text-base lg:text-lg">Team Chat</h3>
                                <p className="text-xs md:text-sm text-base-content/60">5 members online</p>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div className="chat chat-start">
                                <div className="chat-bubble chat-bubble-primary text-xs md:text-sm">
                                  Hey team! 👋 Ready for today's standup?
                                </div>
                              </div>
                              <div className="chat chat-end">
                                <div className="chat-bubble text-xs md:text-sm">
                                  Absolutely! Just finished the new feature
                                </div>
                              </div>
                              <div className="chat chat-start">
                                <div className="chat-bubble chat-bubble-secondary text-xs md:text-sm">
                                  Awesome work! 🚀
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Sidebar Preview */}
                      <div className="space-y-2 md:space-y-3">
                        {[
                          { icon: Hash, label: "Friends", badge: "3", color: "text-primary" },
                          { icon: Users, label: "Groups", color: "text-secondary" },
                          { icon: MessageCircle, label: "Random", color: "text-accent" }
                        ].map((item, index) => (
                          <div key={index} className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="card-body p-2 md:p-3">
                              <div className="flex items-center gap-2">
                                <item.icon className={`w-3 md:w-4 h-3 md:h-4 ${item.color}`} />
                                <span className="text-xs md:text-sm font-medium">{item.label}</span>
                                {item.badge && (
                                  <div className="badge badge-primary badge-xs">{item.badge}</div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-base-content/60" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-20 lg:py-24 bg-base-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16 lg:mb-20">
            <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-base-content mb-4 md:mb-6">
              Everything you need to
              <span className="text-primary block">stay connected</span>
            </h2>
            <p className="text-lg md:text-xl lg:text-2xl text-base-content/70 max-w-3xl mx-auto">
              Powerful features designed to make communication effortless and enjoyable
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="card-body p-6 md:p-8">
                  <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl bg-opacity-20 flex items-center justify-center mb-4 md:mb-6 ${feature.color.replace('text-', 'bg-')}`}>
                    <feature.icon className={`w-6 h-6 md:w-8 md:h-8 ${feature.color}`} />
                  </div>
                  <h3 className="card-title text-lg md:text-xl lg:text-2xl mb-2 md:mb-3">{feature.title}</h3>
                  <p className="text-base-content/70 text-sm md:text-base leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Support Section */}
      <section className="py-16 md:py-20 lg:py-24 bg-base-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-base-content mb-4 md:mb-6">
              Available everywhere
              <span className="text-info block">you are</span>
            </h2>
            <p className="text-lg md:text-xl text-base-content/70">
              Access your conversations on any device, anytime
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
            <div className="card bg-base-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="card-body text-center p-6 md:p-8">
                <Monitor className="w-16 h-16 md:w-20 md:h-20 text-secondary mx-auto mb-4 md:mb-6" />
                <h3 className="card-title justify-center text-lg md:text-xl lg:text-2xl mb-2 md:mb-3">Desktop</h3>
                <p className="text-base-content/70 text-sm md:text-base">Windows, macOS, and Linux desktop applications</p>
              </div>
            </div>
            <div className="card bg-base-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="card-body text-center p-6 md:p-8">
                <Tablet className="w-16 h-16 md:w-20 md:h-20 text-accent mx-auto mb-4 md:mb-6" />
                <h3 className="card-title justify-center text-lg md:text-xl lg:text-2xl mb-2 md:mb-3">Web Browser</h3>
                <p className="text-base-content/70 text-sm md:text-base">Full-featured web app accessible from any browser</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer footer-center p-8 md:p-10 lg:p-12 bg-base-200 text-base-content">
        <div className="grid grid-flow-col gap-4 flex-wrap justify-center">
          <a className="link link-hover text-sm md:text-base">About</a>
          <a className="link link-hover text-sm md:text-base">Contact</a>
          <a className="link link-hover text-sm md:text-base">Privacy Policy</a>
                    <a className="link link-hover text-sm md:text-base">Terms of Service</a>
          <a className="link link-hover text-sm md:text-base">Support</a>
        </div>
        <div>
          <div className="grid grid-flow-col gap-4">
            <a className="btn btn-ghost btn-circle">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
              </svg>
            </a>
            <a className="btn btn-ghost btn-circle">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
              </svg>
            </a>
            <a className="btn btn-ghost btn-circle">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
              </svg>
            </a>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-primary" />
            <span className="font-bold text-xl">Chatty</span>
          </div>
          <p className="mt-2 text-sm md:text-base">© 2024 Chatty. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;