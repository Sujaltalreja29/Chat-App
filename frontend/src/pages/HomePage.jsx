// In HomePage.jsx - Fix the imports at the top:

import { useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useCallStore } from "../store/useCallStore"; // ADD this import
import { useResponsive } from "../hooks/useResponsive";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import MobileChatHeader from "../components/MobileChatHeader";
import IncomingCall from "../components/IncomingCall";
import CallWindow from "../components/CallWindow";

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
      setShowSidebar(!hasActiveChat);
      setShowChat(hasActiveChat);
    } else {
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

  // 🔥 FIX: Simple state viewer component
  const StateViewer = () => {
    const [currentState, setCurrentState] = useState({});
    
    useEffect(() => {
      const interval = setInterval(() => {
        const state = useCallStore.getState();
        setCurrentState({
          callStatus: state.callStatus,
          showCallWindow: state.showCallWindow,
          showIncomingCall: state.showIncomingCall,
          hasCurrentCall: !!state.currentCall,
          currentCallType: state.currentCall?.type,
          otherUser: state.currentCall?.otherUserInfo?.fullName
        });
      }, 500);
      
      return () => clearInterval(interval);
    }, []);
    
    return (
      <div className="fixed top-4 left-4 z-[10000] bg-red-900 text-white p-3 text-xs max-w-sm">
        <h3 className="text-yellow-400 font-bold">STATE:</h3>
        <div>Status: <span className="text-green-400">{currentState.callStatus}</span></div>
        <div>Show Window: <span className="text-blue-400">{currentState.showCallWindow ? 'YES' : 'NO'}</span></div>
        <div>Show Incoming: <span className="text-purple-400">{currentState.showIncomingCall ? 'YES' : 'NO'}</span></div>
        <div>Has Call: <span className="text-orange-400">{currentState.hasCurrentCall ? 'YES' : 'NO'}</span></div>
        <div>Call Type: <span className="text-pink-400">{currentState.currentCallType || 'NONE'}</span></div>
        <div>Other User: <span className="text-cyan-400">{currentState.otherUser || 'NONE'}</span></div>
      </div>
    );
  };

  return (
    <div className={`bg-base-200 flex flex-col overflow-hidden ${
      showMobileLayout 
        ? 'h-[calc(100vh-3rem)]'
        : 'h-[calc(100vh-5rem)]'
    }`}>
      
      {/* State Viewer */}
      <StateViewer />
      
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

      {/* Voice Call Components */}
      <IncomingCall />
      <CallWindow />
    </div>
  );
};

export default HomePage;