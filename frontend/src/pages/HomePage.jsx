// src/pages/HomePage.jsx - Fixed mobile layout to show only sidebar when no chat selected
import { useState } from "react";
import { useResponsive } from "../hooks/useResponsive";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import NoChatSelected from "../components/NoChatSelected";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Info, RotateCcw } from "lucide-react";

const HomePage = () => {
  const { selectedUser, selectedGroup } = useChatStore();
  const { getFriends, clearChat } = useChatStore();
  const { authUser, resetDemo, isResettingDemo } = useAuthStore();
  const { showMobileLayout } = useResponsive();
  const [showSidebar, setShowSidebar] = useState(!showMobileLayout);

  const handleChatSelect = () => {
    if (showMobileLayout) {
      setShowSidebar(false);
    }
  };

  const hasSelectedChat = selectedUser || selectedGroup;
  const isDemoAccount = authUser?.email === "demo@chatty.app" || authUser?.email === "alex@chatty.app";

  const handleResetDemo = async () => {
    const didReset = await resetDemo();
    if (didReset) {
      clearChat();
      await getFriends();
    }
  };

  return (
    // Full screen height with proper top spacing for navbar
    <div className="h-screen flex flex-col bg-base-100 pt-16 lg:pt-20">
      {isDemoAccount && (
        <div className="flex-shrink-0 border-b border-primary/20 bg-primary/10 px-4 py-2">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 text-sm text-base-content">
            <Info className="h-4 w-4 flex-shrink-0 text-primary" />
            <span className="flex-1 min-w-[220px]">
              Demo mode: use the avatar menu to switch between Chatty Demo and Alex. Reset restores the starter conversation.
            </span>
            <button
              type="button"
              onClick={handleResetDemo}
              disabled={isResettingDemo}
              className="btn btn-ghost btn-sm gap-2 text-primary"
            >
              <RotateCcw className={`h-4 w-4 ${isResettingDemo ? "animate-spin" : ""}`} />
              {isResettingDemo ? "Resetting..." : "Reset demo"}
            </button>
          </div>
        </div>
      )}
      <div className="flex min-h-0 flex-1">
      
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
    </div>
  );
};

export default HomePage;