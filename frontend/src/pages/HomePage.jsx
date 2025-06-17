// src/pages/HomePage.jsx - Fixed height layout
import { useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useResponsive } from "../hooks/useResponsive";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import MobileChatHeader from "../components/MobileChatHeader";

const HomePage = () => {
  const { selectedUser, selectedGroup, chatType } = useChatStore();
  const { isMobile, isTablet, showMobileLayout, canShowBothPanes } = useResponsive();
  
  // Mobile navigation state
  const [showSidebar, setShowSidebar] = useState(!showMobileLayout);
  const [showChat, setShowChat] = useState(false);

  const hasActiveChat = selectedUser || selectedGroup;

  // Handle responsive layout changes
  useEffect(() => {
    if (showMobileLayout) {
      // Mobile: Show sidebar by default, chat when selected
      setShowSidebar(!hasActiveChat);
      setShowChat(hasActiveChat);
    } else {
      // Desktop: Always show both
      setShowSidebar(true);
      setShowChat(true);
    }
  }, [hasActiveChat, showMobileLayout]);

  // Handle mobile back navigation
  const handleBackToSidebar = () => {
    if (showMobileLayout) {
      setShowSidebar(true);
      setShowChat(false);
    }
  };

  return (
    <div className={`bg-base-200 flex flex-col overflow-hidden ${
      showMobileLayout 
        ? 'h-[calc(100vh-3rem)]' // Mobile: Account for minimal navbar
        : 'h-[calc(100vh-5rem)]'  // Desktop: Account for full navbar
    }`}>
      
      {/* Mobile Chat Header (only when chat is active) */}
      {showMobileLayout && hasActiveChat && showChat && (
        <div className="flex-none">
          <MobileChatHeader onBack={handleBackToSidebar} />
        </div>
      )}

      {/* Main Chat Layout - Fixed Height */}
      <div className="flex flex-1 relative overflow-hidden min-h-0">
        
        {/* Sidebar */}
        <div
          className={`
            bg-base-100 border-r border-base-300 transition-all duration-300 ease-in-out z-sidebar flex-none
            ${showMobileLayout 
              ? `fixed top-0 left-0 h-full ${
                  showSidebar 
                    ? 'w-full translate-x-0' 
                    : 'w-full -translate-x-full'
                }`
              : canShowBothPanes
                ? 'w-96'
                : 'w-80'
            }
          `}
          style={{
            height: showMobileLayout ? '100%' : 'auto'
          }}
        >
          <Sidebar 
            onChatSelect={() => {
              if (showMobileLayout) {
                setShowSidebar(false);
                setShowChat(true);
              }
            }}
            isMobile={showMobileLayout}
          />
        </div>

        {/* Chat Container - Fixed Height */}
        <div
          className={`
            flex flex-col transition-all duration-300 ease-in-out flex-1 min-w-0 overflow-hidden
            ${showMobileLayout 
              ? `${showChat ? 'block' : 'hidden'}`
              : 'block'
            }
          `}
        >
          {hasActiveChat ? (
            <ChatContainer 
              onBackClick={handleBackToSidebar}
              isMobile={showMobileLayout}
            />
          ) : (
            <NoChatSelected />
          )}
        </div>
      </div>

      {/* Mobile Overlay */}
      {showMobileLayout && showSidebar && hasActiveChat && (
        <div
          className="fixed inset-0 bg-black/20 z-overlay"
          onClick={handleBackToSidebar}
        />
      )}
    </div>
  );
};

export default HomePage;