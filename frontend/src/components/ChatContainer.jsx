// src/components/ChatContainer.jsx
import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";
import { useResponsive } from "../hooks/useResponsive";
import { useVirtualKeyboard } from "../hooks/useKeyboard";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import TypingIndicator from "./TypingIndicator";
import InfiniteScrollMessages from "./InfiniteScrollMessages";
import FileMessage from "./FileMessage";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { CheckCheck, MessageSquare, Hash } from "lucide-react";

const ChatContainer = ({ onBackClick, isMobile = false }) => {
  const {
    messages,
    getMessages,
    loadMoreMessages,
    isMessagesLoading,
    isLoadingMoreMessages,
    hasMoreMessages,
    selectedUser,
    selectedGroup,
    subscribeToMessages,
    unsubscribeFromMessages,
    chatType,
    typingUsers
  } = useChatStore();
  
  const { authUser } = useAuthStore();
  const { showMobileLayout, isSmallMobile } = useResponsive();
  const { isKeyboardOpen, keyboardHeight } = useVirtualKeyboard();
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (chatType === 'direct' && selectedUser && messages.length === 0) {
      getMessages(selectedUser._id, 'direct');
    } else if (chatType === 'group' && selectedGroup && messages.length === 0) {
      getMessages(selectedGroup._id, 'group');
    }

    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser, selectedGroup, chatType]);

  const handleLoadMore = () => {
    if (chatType === 'direct' && selectedUser) {
      loadMoreMessages(selectedUser._id, 'direct');
    } else if (chatType === 'group' && selectedGroup) {
      loadMoreMessages(selectedGroup._id, 'group');
    }
  };

  // Auto-scroll to bottom for new messages
  useEffect(() => {
    if (messageEndRef.current && messages?.length > 0) {
      const lastMessage = messages[messages.length - 1];
      const isOwnMessage = lastMessage.senderId._id === authUser._id;
      
      if (isOwnMessage) {
        messageEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [messages, authUser._id]);

  if (isMessagesLoading) {
    return (
      <div className={`flex-1 flex flex-col h-full bg-base-100 ${
        showMobileLayout ? 'h-screen-safe' : ''
      }`}>
        {!showMobileLayout && <ChatHeader />}
        <div className="flex-1 overflow-hidden">
          <MessageSkeleton />
        </div>
        <MessageInput />
      </div>
    );
  }

  return (
    <div 
      className={`flex-1 flex flex-col bg-base-100 ${
        showMobileLayout 
          ? `h-full ${isKeyboardOpen ? 'pb-safe-bottom' : ''}` 
          : 'h-full'
      }`}
      style={{
        height: showMobileLayout && isKeyboardOpen 
          ? `calc(100vh - ${keyboardHeight}px)` 
          : undefined
      }}
    >
      {/* Fixed Header - Hide on mobile (handled by MobileChatHeader) */}
      {!showMobileLayout && <ChatHeader />}

      {/* Messages Container */}
      {messages?.length === 0 ? (
        /* Empty State */
        <div className={`flex-1 flex flex-col items-center justify-center text-center bg-base-200 ${
          showMobileLayout ? 'px-4' : 'px-4'
        }`}>
          <div className={`bg-base-300 rounded-full flex items-center justify-center mb-4 ${
            showMobileLayout ? 'w-12 h-12' : 'w-16 h-16'
          }`}>
            {chatType === 'group' ? (
              <Hash className={`text-base-content/50 ${
                showMobileLayout ? 'w-6 h-6' : 'w-8 h-8'
              }`} />
            ) : (
              <MessageSquare className={`text-base-content/50 ${
                showMobileLayout ? 'w-6 h-6' : 'w-8 h-8'
              }`} />
            )}
          </div>
          <h3 className={`font-semibold text-base-content mb-2 ${
            showMobileLayout ? 'text-base' : 'text-lg'
          }`}>
            No messages yet
          </h3>
          <p className={`text-base-content/70 max-w-sm ${
            showMobileLayout ? 'text-sm' : 'text-base'
          }`}>
            {chatType === 'group' && selectedGroup ? (
              <>Start the conversation in <span className="font-medium text-base-content">{selectedGroup.name}</span></>
            ) : selectedUser ? (
              <>Start the conversation with <span className="font-medium text-base-content">{selectedUser.fullName}</span></>
            ) : (
              'Select a chat to start messaging'
            )}
          </p>
        </div>
      ) : (
        /* Messages with Infinite Scroll */
        <InfiniteScrollMessages
          hasMore={hasMoreMessages}
          isLoadingMore={isLoadingMoreMessages}
          onLoadMore={handleLoadMore}
          className="bg-base-200"
        >
          {messages?.map((message, index) => {
            const isOwn = message.senderId._id === authUser._id;
            const showAvatar = index === 0 || messages[index - 1].senderId._id !== message.senderId._id;
            const showSenderName = chatType === 'group' && !isOwn && showAvatar;

            return (
              <div
                key={message._id}
                className={`flex ${
                  showMobileLayout ? 'gap-2' : 'gap-3'
                } ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                {/* Avatar - Left side for others */}
                {!isOwn && (
                  <div className="flex-shrink-0 self-end">
                    {showAvatar ? (
                      <img
                        src={message.senderId.profilePic || "/avatar.png"}
                        alt={message.senderId.fullName}
                        className={`rounded-full object-cover border-2 border-base-100 shadow-sm ${
                          showMobileLayout ? 'w-6 h-6' : 'w-8 h-8'
                        }`}
                      />
                    ) : (
                      <div className={showMobileLayout ? 'w-6 h-6' : 'w-8 h-8'}></div>
                    )}
                  </div>
                )}

                {/* Message Content */}
                <div className={`flex flex-col ${
                  showMobileLayout 
                    ? 'max-w-[85%]' 
                    : 'max-w-[75%] sm:max-w-[60%]'
                } ${isOwn ? 'items-end' : 'items-start'}`}>
                  
                  {/* Sender Name for Groups */}
                  {showSenderName && (
                    <div className={`mb-1 ${showMobileLayout ? 'ml-1' : 'ml-2'}`}>
                      <span className={`font-semibold text-base-content/80 ${
                        showMobileLayout ? 'text-xs' : 'text-xs'
                      }`}>
                        {message.senderId.fullName}
                      </span>
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`relative rounded-2xl shadow-sm ${
                      showMobileLayout ? 'px-3 py-2' : 'px-4 py-3'
                    } ${
                      isOwn
                        ? 'bg-primary text-primary-content rounded-br-md'
                        : 'bg-base-100 text-base-content border border-base-300 rounded-bl-md'
                    }`}
                  >
                    {/* File Message Support */}
                    {message.file && (
                      <div className={message.text ? "mb-3" : ""}>
                        <FileMessage 
                          file={message.file} 
                          isOwn={isOwn} 
                          isMobile={showMobileLayout}
                        />
                      </div>
                    )}

                    {/* Legacy Image Message */}
                    {message.image && !message.file && (
                      <div className={message.text ? "mb-3" : ""}>
                        <img
                          src={message.image}
                          alt="Shared image"
                          className={`w-full rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity ${
                            showMobileLayout ? 'max-w-[200px]' : 'max-w-[250px]'
                          }`}
                          onClick={() => window.open(message.image, '_blank')}
                        />
                      </div>
                    )}

                    {/* Text Message */}
                    {message.text && (
                      <p className={`leading-relaxed break-words whitespace-pre-wrap ${
                        showMobileLayout ? 'text-sm' : 'text-sm'
                      }`}>
                        {message.text}
                      </p>
                    )}

                    {/* Message Time - Inside bubble for own messages */}
                    {isOwn && (
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <time className={`text-primary-content/70 ${
                          showMobileLayout ? 'text-xs' : 'text-xs'
                        }`}>
                          {formatMessageTime(message.createdAt)}
                        </time>
                        <div className="text-primary-content/70">
                          <CheckCheck className={showMobileLayout ? 'w-3 h-3' : 'w-3 h-3'} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Message Time - Outside bubble for received messages */}
                  {!isOwn && (
                    <div className={`mt-1 ${showMobileLayout ? 'ml-1' : 'ml-2'}`}>
                      <time className={`text-base-content/60 ${
                        showMobileLayout ? 'text-xs' : 'text-xs'
                      }`}>
                        {formatMessageTime(message.createdAt)}
                      </time>
                    </div>
                  )}
                </div>

                {/* Avatar - Right side for own messages */}
                {isOwn && (
                  <div className="flex-shrink-0 self-end">
                    {showAvatar ? (
                      <img
                        src={authUser.profilePic || "/avatar.png"}
                        alt={authUser.fullName}
                        className={`rounded-full object-cover border-2 border-base-100 shadow-sm ${
                          showMobileLayout ? 'w-6 h-6' : 'w-8 h-8'
                        }`}
                      />
                    ) : (
                      <div className={// src/components/ChatContainer.jsx (continued)
                        showMobileLayout ? 'w-6 h-6' : 'w-8 h-8'
                      }></div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messageEndRef} className="h-1" />
        </InfiniteScrollMessages>
      )}

      {/* Typing Indicator */}
      <TypingIndicator 
        typingUsers={typingUsers} 
        chatType={chatType} 
        isMobile={showMobileLayout}
      />

      {/* Fixed Input at Bottom */}
      <div className={`border-t border-base-300 bg-base-100 ${
        showMobileLayout ? 'pb-safe-bottom' : ''
      }`}>
        <MessageInput isMobile={showMobileLayout} />
      </div>
    </div>
  );
};

export default ChatContainer;