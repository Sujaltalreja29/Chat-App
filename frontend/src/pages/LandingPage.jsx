// pages/LandingPage.jsx - Modern Landing Page
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

  const pricingPlans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for personal use",
      features: [
        "Unlimited 1-on-1 chats",
        "Group chats up to 10 people",
        "5GB file storage",
        "Basic search",
        "Mobile & web access"
      ],
      popular: false,
      cta: "Get Started Free"
    },
    {
      name: "Pro",
      price: "$9.99",
      period: "per month",
      description: "Great for teams and power users",
      features: [
        "Everything in Free",
        "Unlimited group size",
        "100GB file storage",
        "Advanced search",
        "Voice & video calls",
        "Priority support"
      ],
      popular: true,
      cta: "Start Free Trial"
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "pricing",
      description: "For large organizations",
      features: [
        "Everything in Pro",
        "Unlimited storage",
        "Advanced admin controls",
        "SSO integration",
        "24/7 dedicated support",
        "Custom integrations"
      ],
      popular: false,
      cta: "Contact Sales"
    }
  ];

  return (
    <div className="min-h-screen bg-base-100">
      {/* Navigation */}
      <div className="navbar bg-base-100 border-b border-base-300 sticky top-0 z-50 backdrop-blur-lg bg-base-100/90">
        <div className="container mx-auto px-4">
          <div className="flex-1">
            <Link to="/" className="btn btn-ghost text-xl font-bold">
              <MessageCircle className="w-6 h-6 text-primary mr-2" />
              Chatty
            </Link>
          </div>
          <div className="flex-none">
            <div className="hidden md:flex items-center space-x-4">
              <a href="#features" className="btn btn-ghost">Features</a>
              <Link to="/login" className="btn btn-ghost">Sign In</Link>
              <Link to="/signup" className="btn btn-primary">Get Started</Link>
            </div>
            <div className="dropdown dropdown-end md:hidden">
              <div tabIndex={0} role="button" className="btn btn-ghost">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </div>
              <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                <li><a href="#features">Features</a></li>
                <li><Link to="/login">Sign In</Link></li>
                <li><Link to="/signup">Get Started</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="hero min-h-screen bg-gradient-to-br from-base-200 to-base-300">
        <div className="hero-content text-center max-w-4xl mx-auto px-4">
          <div className="space-y-8">

            {/* Main Heading */}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-base-content leading-tight pt-8">
              Connect, Chat, and
              <span className="text-primary block">Collaborate</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-base-content/80 max-w-2xl mx-auto leading-relaxed">
              The modern messaging platform that brings people together. 
              Fast, secure, and feature-rich communication for everyone.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link to="/signup" className="btn btn-primary btn-lg gap-2">
                Start Chatting Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Demo Preview */}
            <div className="pt-8 pb-8">
              <div className="mockup-browser border border-base-300 bg-base-100 shadow-2xl max-w-4xl mx-auto">
                <div className="mockup-browser-toolbar">
                  <div className="input">https://chatty.com</div>
                </div>
                <div className="bg-base-200 px-4 py-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Chat Preview */}
                    <div className="md:col-span-2">
                      <div className="card bg-base-100 shadow-lg">
                        <div className="card-body p-4">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="avatar online">
                              <div className="w-10 rounded-full">
                                <img src="/avatar.png" alt="User" />
                              </div>
                            </div>
                            <div>
                              <h3 className="font-semibold">Team Chat</h3>
                              <p className="text-sm text-base-content/60">5 members online</p>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="chat chat-start">
                              <div className="chat-bubble chat-bubble-primary text-sm">
                                Hey team! 👋 Ready for today's standup?
                              </div>
                            </div>
                            <div className="chat chat-end">
                              <div className="chat-bubble text-sm">
                                Absolutely! Just finished the new feature
                              </div>
                            </div>
                            <div className="chat chat-start">
                              <div className="chat-bubble chat-bubble-secondary text-sm">
                                Awesome work! 🚀
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Sidebar Preview */}
                    <div className="space-y-2">
                      <div className="card bg-base-100 shadow-sm">
                        <div className="card-body p-3">
                          <div className="flex items-center gap-2">
                            <Hash className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium">Friends</span>
                            <div className="badge badge-primary badge-xs">3</div>
                          </div>
                        </div>
                      </div>
                      <div className="card bg-base-100 shadow-sm">
                        <div className="card-body p-3">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-secondary" />
                            <span className="text-sm font-medium">Groups</span>
                          </div>
                        </div>
                      </div>
                      <div className="card bg-base-100 shadow-sm">
                        <div className="card-body p-3">
                          <div className="flex items-center gap-2">
                            <MessageCircle className="w-4 h-4 text-accent" />
                            <span className="text-sm font-medium">Random</span>
                          </div>
                        </div>
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
      <section id="features" className="py-20  bg-base-200">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-base-content mb-4">
              Everything you need to
              <span className="text-primary block">stay connected</span>
            </h2>
            <p className="text-xl text-base-content/70 max-w-2xl mx-auto">
              Powerful features designed to make communication effortless and enjoyable
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
                <div className="card-body">
                  <div className={`w-12 h-12 rounded-lg bg-opacity-20 flex items-center justify-center mb-4 ${feature.color.replace('text-', 'bg-')}`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="card-title text-xl">{feature.title}</h3>
                  <p className="text-base-content/70">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Support Section */}
      <section className="py-20 bg-base-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-base-content mb-4">
              Available everywhere
              <span className="text-info block">you are</span>
            </h2>
            <p className="text-xl text-base-content/70">
              Access your conversations on any device, anytime
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* <div className="card bg-base-200 shadow-lg hover:shadow-xl transition-shadow">
              <div className="card-body text-center">
                <Smartphone className="w-16 h-16 text-primary mx-auto mb-4" />
                <h3 className="card-title justify-center">Mobile Apps</h3>
                <p className="text-base-content/70">Native iOS and Android apps with full feature support</p>
              </div>
            </div> */}
            <div className="card bg-base-200 shadow-lg hover:shadow-xl transition-shadow">
              <div className="card-body text-center">
                <Monitor className="w-16 h-16 text-secondary mx-auto mb-4" />
                <h3 className="card-title justify-center">Desktop</h3>
                <p className="text-base-content/70">Windows, macOS, and Linux desktop applications</p>
              </div>
            </div>
            <div className="card bg-base-200 shadow-lg hover:shadow-xl transition-shadow">
              <div className="card-body text-center">
                <Tablet className="w-16 h-16 text-accent mx-auto mb-4" />
                <h3 className="card-title justify-center">Web Browser</h3>
                <p className="text-base-content/70">Full-featured web app accessible from any browser</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto text-primary-content">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to transform your communication?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join millions of users who trust Chatty for their daily conversations. 
              Start your journey today - it's free!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup" className="btn btn-accent btn-lg gap-2">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/login" className="btn btn-outline btn-lg text-white border-white hover:bg-white hover:text-primary">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer footer-center p-10 bg-base-200 text-base-content">
        <div className="grid grid-flow-col gap-4">
          <a className="link link-hover">About</a>
          <a className="link link-hover">Contact</a>
          <a className="link link-hover">Privacy Policy</a>
          <a className="link link-hover">Terms of Service</a>
          <a className="link link-hover">Support</a>
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
          <p className="mt-2">© 2024 Chatty. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;