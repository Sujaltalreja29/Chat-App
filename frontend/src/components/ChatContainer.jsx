// src/components/ChatContainer.jsx - FIXED prop names
import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";
import { useResponsive } from "../hooks/useResponsive";
import { useVirtualKeyboard } from "../hooks/useKeyboard";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import TypingIndicator from "./TypingIndicator";
import InfiniteScrollMessages from "./InfiniteScrollMessages";
import FileMessage from "./FileMessage";
import { useSearchStore } from "../store/useSearchStore";
import SearchBar from "./SearchBar";
import SearchResults from "./SearchResults";
import { useAuthStore } from "../store/useAuthStore";
import DateSeparator from "./DateSeparator";
import { formatMessageTime, shouldShowDateSeparator } from "../lib/utils";
import { CheckCheck, MessageSquare, Hash, Search, X, ArrowLeft } from "lucide-react";
import MobileChatHeader from "./MobileChatHeader";

// 🔥 FIXED: Update prop names to match HomePage
const ChatContainer = ({ onBackToSidebar, isMobile = false }) => {
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
    typingUsers,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const { showMobileLayout, isSmallMobile } = useResponsive();
  const { isKeyboardOpen, keyboardHeight } = useVirtualKeyboard();
  const {
    showConversationSearch,
    searchQuery,
    conversationSearchResults,
    isSearching,
    toggleConversationSearch,
    setSearchQuery,
    searchInConversation,
    currentChatId,
    currentChatType,
  } = useSearchStore();

  const messageEndRef = useRef(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);
  const messagesContainerRef = useRef(null);

  const isSearchActive =
    showConversationSearch &&
    ((chatType === "direct" && currentChatId === selectedUser?._id) ||
      (chatType === "group" && currentChatId === selectedGroup?._id));

  useEffect(() => {
    if (chatType === "direct" && selectedUser && messages.length === 0) {
      getMessages(selectedUser._id, "direct");
    } else if (chatType === "group" && selectedGroup && messages.length === 0) {
      getMessages(selectedGroup._id, "group");
    }

    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser, selectedGroup, chatType]);

  const handleLoadMore = () => {
    if (chatType === "direct" && selectedUser) {
      loadMoreMessages(selectedUser._id, "direct");
    } else if (chatType === "group" && selectedGroup) {
      loadMoreMessages(selectedGroup._id, "group");
    }
  };

  const highlightSearchText = (text, query) => {
    if (!text || !query) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return (
      <span>
        {parts.map((part, index) => 
          regex.test(part) ? (
            <mark key={index} className="bg-green-200 text-green-900 px-1 rounded font-medium">
              {part}
            </mark>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </span>
    );
  };

  const handleSearchClose = () => {
    toggleConversationSearch();
  };

  useEffect(() => {
    if (!isSearchActive || !searchQuery) return;

    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        const chatId =
          chatType === "group" ? selectedGroup?._id : selectedUser?._id;
        searchInConversation(searchQuery, chatId, chatType);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, isSearchActive, chatType, selectedUser, selectedGroup]);

  // UPDATED: Better scroll to message function
  const scrollToMessage = (messageId, fromGlobalSearch = false) => {
    console.log("🎯 Navigating to message:", messageId, fromGlobalSearch ? "(from global search)" : "(from conversation search)");
    
    // Close conversation search if it's open
    if (!fromGlobalSearch) {
      handleSearchClose();
    }
    
    // Set highlighted message
    setHighlightedMessageId(messageId);
    
    // Wait a moment for potential search close and re-render
    const delay = fromGlobalSearch ? 100 : 300;
    
    setTimeout(() => {
      const messageElement = document.getElementById(`message-${messageId}`);
      
      if (messageElement) {
        console.log("✅ Message element found, scrolling...");
        
        // Scroll to message
        messageElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        
        // Remove highlight after 4 seconds for global search (longer for visibility)
        setTimeout(() => {
          setHighlightedMessageId(null);
        }, fromGlobalSearch ? 4000 : 3000);
      } else {
        console.log("❌ Message not found in current view");
        
        if (fromGlobalSearch) {
          console.log("⚠️ Message not found after global search navigation");
        } else {
          console.log("ℹ️ Message may be in older messages, would need to implement loading");
        }
      }
    }, delay);
  };

  useEffect(() => {
    if (messageEndRef.current) {
      delete messageEndRef.current.dataset.initialized;
    }
  }, [selectedUser, selectedGroup, chatType]);

  // Auto-scroll to bottom for new messages
  useEffect(() => {
    if (messageEndRef.current && messages?.length > 0) {
      const lastMessage = messages[messages.length - 1];
      const isOwnMessage = lastMessage.senderId._id === authUser._id;

      const isInitialLoad = !messageEndRef.current.dataset.initialized;
      if (isInitialLoad) {
        // First time loading messages - scroll instantly
        messageEndRef.current.scrollIntoView({ behavior: "instant" });
        messageEndRef.current.dataset.initialized = "true";
      } else if (isOwnMessage) {
        // Only smooth scroll for messages you send
        messageEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [messages, authUser._id]);

  useEffect(() => {
    const messageIdToScrollTo = sessionStorage.getItem('scrollToMessageId');
    
    if (messageIdToScrollTo && messages.length > 0) {
      console.log("🎯 Found message to scroll to:", messageIdToScrollTo);
      
      // Small delay to ensure messages are rendered
      setTimeout(() => {
        scrollToMessage(messageIdToScrollTo, true); // true = from global search
        
        // Clear the stored message ID
        sessionStorage.removeItem('scrollToMessageId');
      }, 500);
    }
  }, [messages, selectedUser, selectedGroup]);

  if (isMessagesLoading) {
    return (
      <div className={`flex-1 flex flex-col h-full bg-base-100`}>
        {!showMobileLayout && <ChatHeader />}
        {showMobileLayout && (
          <div className="flex-shrink-0">
            <MobileChatHeader onBack={onBackToSidebar} />
          </div>
        )}
        <div className="flex-1 overflow-hidden">
          <MessageSkeleton />
        </div>
        <MessageInput />
      </div>
    );
  }

  return (
    <div className={`flex-1 flex flex-col bg-base-100 h-full`}>
      {/* Fixed Header */}
      {!showMobileLayout && <ChatHeader />}
      {showMobileLayout && (
        <div className="flex-shrink-0">
          <MobileChatHeader onBack={onBackToSidebar} />
        </div>
      )}

      {/* 🔥 Conversation Search Bar */}
      {isSearchActive && (
        <div className="border-b border-base-300 bg-base-100 p-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            {showMobileLayout && (
              <button
                onClick={handleSearchClose}
                className="btn btn-ghost btn-sm btn-circle"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-base-content/50" />
              <input
                type="text"
                placeholder={`Search in ${
                  chatType === "group"
                    ? selectedGroup?.name
                    : selectedUser?.fullName
                }...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input input-bordered input-sm w-full pl-10 pr-10"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 btn btn-ghost btn-xs btn-circle"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            {!showMobileLayout && (
              <button
                onClick={handleSearchClose}
                className="btn btn-ghost btn-sm btn-circle"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search Results Count */}
          {searchQuery && (
            <div className="mt-2">
              <p className="text-xs text-base-content/60">
                {isSearching
                  ? "Searching..."
                  : conversationSearchResults.length > 0
                  ? `${conversationSearchResults.length} result${
                      conversationSearchResults.length !== 1 ? "s" : ""
                    } found`
                  : searchQuery.length >= 2
                  ? "No results found"
                  : ""}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Messages Container */}
      {messages?.length === 0 && !isSearchActive ? (
        /* Empty State */
        <div className={`flex-1 flex flex-col items-center justify-center text-center bg-base-200 px-4`}>
          <div className={`bg-base-300 rounded-full flex items-center justify-center mb-4 ${
            showMobileLayout ? "w-12 h-12" : "w-16 h-16"
          }`}>
            {chatType === "group" ? (
              <Hash className={`text-base-content/50 ${showMobileLayout ? "w-6 h-6" : "w-8 h-8"}`} />
            ) : (
              <MessageSquare className={`text-base-content/50 ${showMobileLayout ? "w-6 h-6" : "w-8 h-8"}`} />
            )}
          </div>
          <h3 className={`font-semibold text-base-content mb-2 ${showMobileLayout ? "text-base" : "text-lg"}`}>
            No messages yet
          </h3>
          <p className={`text-base-content/70 max-w-sm ${showMobileLayout ? "text-sm" : "text-base"}`}>
            {chatType === "group" && selectedGroup ? (
              <>
                Start the conversation in{" "}
                <span className="font-medium text-base-content">
                  {selectedGroup.name}
                </span>
              </>
            ) : selectedUser ? (
              <>
                Start the conversation with{" "}
                <span className="font-medium text-base-content">
                  {selectedUser.fullName}
                </span>
              </>
            ) : (
              "Select a chat to start messaging"
            )}
          </p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col bg-base-200 overflow-hidden">
          {/* Search Results */}
          {isSearchActive && searchQuery && (
            <div className="border-b border-base-300 bg-base-100 flex-shrink-0">
              <div className="px-4 py-2 bg-base-200 border-b border-base-300">
                <p className="text-xs font-medium text-base-content/70">
                  {isSearching ? 'Searching...' : 
                   conversationSearchResults.length > 0 ? 
                   `${conversationSearchResults.length} message${conversationSearchResults.length !== 1 ? 's' : ''} found` :
                   searchQuery.length >= 2 ? 'No messages found' : ''
                  }
                </p>
              </div>

                            {conversationSearchResults.length > 0 ? (
                <div className="max-h-60 overflow-y-auto">
                  {conversationSearchResults.map((message, index) => {
                    const isOwn = message.senderId._id === authUser._id;
                    const senderName = isOwn ? 'You' : message.senderId?.fullName;

                    return (
                      <button
                        key={message._id}
                        onClick={() => scrollToMessage(message._id)}
                        className="w-full p-3 border-b border-base-200 hover:bg-base-50 text-left transition-colors group"
                      >
                        {/* Message Header with Sender Info */}
                        <div className="flex items-center gap-2 mb-1">
                          <img
                            src={message.senderId.profilePic || "/avatar.png"}
                            alt={message.senderId.fullName}
                            className="w-6 h-6 rounded-full object-cover border border-base-300"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-base-content truncate">
                                {senderName}
                              </span>
                              <span className="text-xs text-base-content/50 flex-shrink-0 ml-2">
                                {formatMessageTime(message.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Message Content with Highlighting */}
                        <div className="pl-8">
                          {message.text ? (
                            <p className="text-sm text-base-content/80 leading-relaxed line-clamp-2">
                              {highlightSearchText(message.text, searchQuery)}
                            </p>
                          ) : message.file ? (
                            <div className="flex items-center gap-2">
                              <div className="badge badge-primary badge-xs">
                                {message.file.fileType}
                              </div>
                              <span className="text-sm text-base-content/80 truncate">
                                {highlightSearchText(message.file.originalName, searchQuery)}
                              </span>
                            </div>
                          ) : message.image ? (
                            <div className="flex items-center gap-2">
                              <div className="badge badge-primary badge-xs">image</div>
                              <span className="text-sm text-base-content/80">📷 Photo</span>
                            </div>
                          ) : (
                            <span className="text-sm text-base-content/60 italic">Message</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : searchQuery.length >= 2 && !isSearching ? (
                <div className="p-6 text-center">
                  <Search className="w-6 h-6 text-base-content/30 mb-2 mx-auto" />
                  <p className="text-sm text-base-content/60">No messages found</p>
                  <p className="text-xs text-base-content/40 mt-1">Try different keywords</p>
                </div>
              ) : null}
            </div>
          )}

          {/* Regular Messages List */}
          <InfiniteScrollMessages
            hasMore={hasMoreMessages}
            isLoadingMore={isLoadingMoreMessages}
            onLoadMore={handleLoadMore}
            className="bg-base-200 flex-1"
          >
            <div className={`${showMobileLayout ? 'p-2' : 'p-4'} space-y-3`}>
              {messages?.map((message, index) => {
                const isOwn = message.senderId._id === authUser._id;
                const showAvatar = index === 0 || messages[index - 1].senderId._id !== message.senderId._id;
                const showSenderName = chatType === 'group' && !isOwn && showAvatar;
                const isHighlighted = highlightedMessageId === message._id;
                
                // Date separator logic
                const previousMessage = index > 0 ? messages[index - 1] : null;
                const showDateSeparator = shouldShowDateSeparator && shouldShowDateSeparator(message, previousMessage);

                return (
                  <div key={message._id}>
                    {/* Date Separator */}
                    {showDateSeparator && (
                      <DateSeparator 
                        date={message.createdAt} 
                        isMobile={showMobileLayout}
                      />
                    )}

                    {/* Message */}
                    <div
                      id={`message-${message._id}`}
                      className={`flex ${showMobileLayout ? 'gap-2' : 'gap-3'} ${
                        isOwn ? 'justify-end' : 'justify-start'
                      } ${isHighlighted ? 'animate-pulse' : ''}`}
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
                        showMobileLayout ? 'max-w-[80%]' : 'max-w-[75%] sm:max-w-[60%]'
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
                          className={`relative rounded-2xl shadow-sm transition-all duration-1000 ${
                            showMobileLayout ? 'px-3 py-2' : 'px-4 py-3'
                          } ${
                            isOwn
                              ? 'bg-primary text-primary-content rounded-br-md'
                              : 'bg-base-100 text-base-content border border-base-300 rounded-bl-md'
                          } ${
                            isHighlighted 
                              ? 'ring-4 ring-yellow-400 ring-opacity-60 bg-yellow-50 border-yellow-300 shadow-lg scale-105' 
                              : ''
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
                            <div className="flex items-center justify-end mt-1">
                              <time className={`text-primary-content/70 ${
                                showMobileLayout ? 'text-xs' : 'text-xs'
                              }`}>
                                {formatMessageTime(message.createdAt)}
                              </time>
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
                            <div className={showMobileLayout ? 'w-6 h-6' : 'w-8 h-8'}></div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div ref={messageEndRef} className="h-1" />
          </InfiniteScrollMessages>
        </div>
      )}

      {/* Typing Indicator */}
      <TypingIndicator
        typingUsers={typingUsers}
        chatType={chatType}
        isMobile={showMobileLayout}
      />

      {/* Fixed Input at Bottom */}
      <div className="border-t border-base-300 bg-base-100 flex-shrink-0">
        <MessageInput isMobile={showMobileLayout} />
      </div>
    </div>
  );
};

export default ChatContainer;