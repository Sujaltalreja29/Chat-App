// src/pages/HomePage.jsx - Fixed mobile layout to show only sidebar when no chat selected
import { useState } from "react";
import { useResponsive } from "../hooks/useResponsive";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import NoChatSelected from "../components/NoChatSelected";
import { useChatStore } from "../store/useChatStore";

const HomePage = () => {
  const { selectedUser, selectedGroup } = useChatStore();
  const { showMobileLayout } = useResponsive();
  const [showSidebar, setShowSidebar] = useState(!showMobileLayout);

  const handleChatSelect = () => {
    if (showMobileLayout) {
      setShowSidebar(false);
    }
  };

  const hasSelectedChat = selectedUser || selectedGroup;

  return (
    // Full screen height with proper top spacing for navbar
    <div className="h-screen flex bg-base-100 pt-16 lg:pt-20">
      
      {/* 🔥 MOBILE LAYOUT: Show only sidebar OR chat, never both */}
      {showMobileLayout ? (
        <>
          {/* Mobile Sidebar - Show when no chat selected OR when explicitly showing sidebar */}
          {(!hasSelectedChat || showSidebar) && (
            <div className="w-full h-full">
              <Sidebar 
                onChatSelect={handleChatSelect}
                isMobile={showMobileLayout}
              />
            </div>
          )}

          {/* Mobile Chat - Show only when chat is selected AND sidebar is hidden */}
          {hasSelectedChat && !showSidebar && (
            <div className="w-full h-full">
              <ChatContainer 
                onBackToSidebar={() => setShowSidebar(true)}
                isMobile={showMobileLayout}
              />
            </div>
          )}
        </>
      ) : (
        /* 🔥 DESKTOP LAYOUT: Traditional two-panel layout */
        <>
          {/* Desktop Sidebar */}
          <div className="w-80 flex-shrink-0 border-r border-base-300 h-full">
            <Sidebar 
              onChatSelect={handleChatSelect}
              isMobile={false}
            />
          </div>

          {/* Desktop Main Chat Area */}
          <div className="flex-1 flex flex-col h-full">
            {hasSelectedChat ? (
              <ChatContainer 
                onBackToSidebar={() => setShowSidebar(true)}
                isMobile={false}
              />
            ) : (
              <NoChatSelected />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default HomePage;