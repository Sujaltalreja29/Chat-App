import { MessageSquare, Users, ArrowRight, Zap } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-base-200 p-8">
      <div className="max-w-md text-center space-y-8">
        
        {/* Animated Icon Section */}
        <div className="relative">
          <div className="w-24 h-24 bg-primary rounded-3xl flex items-center justify-center mx-auto shadow-xl">
            <MessageSquare className="w-12 h-12 text-primary-content" />
          </div>
          
          {/* Floating elements */}
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-success rounded-full flex items-center justify-center shadow-lg animate-bounce">
            <div className="w-2 h-2 bg-success-content rounded-full"></div>
          </div>
          <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-secondary rounded-full flex items-center justify-center shadow-lg animate-pulse">
            <div className="w-2 h-2 bg-secondary-content rounded-full"></div>
          </div>
        </div>

        {/* Welcome Content */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-base-content">
            Welcome to Chatty!
          </h2>
          <p className="text-lg text-base-content/70 leading-relaxed">
            Select a conversation from the sidebar to start chatting with your friends
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="space-y-3 pt-4">
          <div className="flex items-center gap-3 text-base-content/70">
            <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-accent" />
            </div>
            <span className="text-sm">Real-time messaging</span>
          </div>
          <div className="flex items-center gap-3 text-base-content/70">
            <div className="w-8 h-8 bg-success/20 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-success" />
            </div>
            <span className="text-sm">Connect with friends</span>
          </div>
        </div>

        {/* Call to Action */}
        <div className="pt-6">
          <div className="flex items-center justify-center gap-2 text-primary text-sm font-medium">
            <span>Choose a chat to get started</span>
            <ArrowRight className="w-4 h-4 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoChatSelected;