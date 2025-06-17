// src/components/NoChatSelected.jsx
import { MessageSquare, Users, ArrowRight, Zap } from "lucide-react";
import { useResponsive } from "../hooks/useResponsive";

const NoChatSelected = () => {
  const { isMobile, isSmallMobile } = useResponsive();

  return (
    <div className={`flex-1 flex flex-col items-center justify-center bg-base-200 ${
      isMobile ? 'p-4' : 'p-8'
    }`}>
      <div className={`text-center space-y-6 ${
        isMobile ? 'max-w-xs' : 'max-w-md'
      }`}>
        
        {/* Animated Icon Section */}
        <div className="relative">
          <div className={`bg-primary rounded-3xl flex items-center justify-center mx-auto shadow-xl ${
            isMobile ? 'w-16 h-16' : 'w-24 h-24'
          }`}>
            <MessageSquare className={`text-primary-content ${
              isMobile ? 'w-8 h-8' : 'w-12 h-12'
            }`} />
          </div>
          
          {/* Floating elements - Hide on very small screens */}
          {!isSmallMobile && (
            <>
              <div className={`absolute bg-success rounded-full flex items-center justify-center shadow-lg animate-bounce ${
                isMobile 
                  ? '-top-1 -right-1 w-4 h-4' 
                  : '-top-2 -right-2 w-6 h-6'
              }`}>
                <div className={`bg-success-content rounded-full ${
                  isMobile ? 'w-1 h-1' : 'w-2 h-2'
                }`}></div>
              </div>
              <div className={`absolute bg-secondary rounded-full flex items-center justify-center shadow-lg animate-pulse ${
                isMobile 
                  ? '-bottom-1 -left-1 w-4 h-4' 
                  : '-bottom-2 -left-2 w-6 h-6'
              }`}>
                <div className={`bg-secondary-content rounded-full ${
                  isMobile ? 'w-1 h-1' : 'w-2 h-2'
                }`}></div>
              </div>
            </>
          )}
        </div>

        {/* Welcome Content */}
        <div className={isMobile ? 'space-y-3' : 'space-y-4'}>
          <h2 className={`font-bold text-base-content ${
            isMobile ? 'text-xl' : 'text-3xl'
          }`}>
            Welcome to Chatty!
          </h2>
          <p className={`text-base-content/70 leading-relaxed ${
            isMobile ? 'text-sm' : 'text-lg'
          }`}>
            {isMobile 
              ? 'Select a chat to start messaging'
              : 'Select a conversation from the sidebar to start chatting with your friends'
            }
          </p>
        </div>

        {/* Feature Highlights - Hide on very small screens */}
        {!isSmallMobile && (
          <div className={`pt-4 ${isMobile ? 'space-y-2' : 'space-y-3'}`}>
            <div className="flex items-center gap-3 text-base-content/70">
              <div className={`bg-accent/20 rounded-lg flex items-center justify-center ${
                isMobile ? 'w-6 h-6' : 'w-8 h-8'
              }`}>
                <Zap className={`text-accent ${
                  isMobile ? 'w-3 h-3' : 'w-4 h-4'
                }`} />
              </div>
              <span className={isMobile ? 'text-xs' : 'text-sm'}>
                Real-time messaging
              </span>
            </div>
            <div className="flex items-center gap-3 text-base-content/70">
              <div className={`bg-success/20 rounded-lg flex items-center justify-center ${
                isMobile ? 'w-6 h-6' : 'w-8 h-8'
              }`}>
                <Users className={`text-success ${
                  isMobile ? 'w-3 h-3' : 'w-4 h-4'
                }`} />
              </div>
              <span className={isMobile ? 'text-xs' : 'text-sm'}>
                Connect with friends
              </span>
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className={isMobile ? 'pt-4' : 'pt-6'}>
          <div className="flex items-center justify-center gap-2 text-primary font-medium">
            <span className={isMobile ? 'text-xs' : 'text-sm'}>
              {isMobile ? 'Tap a chat to start' : 'Choose a chat to get started'}
            </span>
            <ArrowRight className={`animate-pulse ${
              isMobile ? 'w-3 h-3' : 'w-4 h-4'
            }`} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoChatSelected;