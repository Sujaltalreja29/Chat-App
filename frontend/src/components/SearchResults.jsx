// components/SearchResults.jsx
import { useState, useEffect } from "react";
import { useSearchStore } from "../store/useSearchStore";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useResponsive } from "../hooks/useResponsive";
import { formatMessageTime } from "../lib/utils";
import FileMessage from "./FileMessage";
import { 
  MessageSquare, Hash, ChevronRight, User, 
  Calendar, MapPin, Loader2, AlertCircle
} from "lucide-react";

const SearchResults = ({ onResultClick, onClose }) => {
  const {
    searchResults,
    searchQuery,
    searchMode,
    totalResults,
    hasMoreResults,
    isSearching,
    loadMoreResults
  } = useSearchStore();
  
  const { setSelectedUser, setSelectedGroup } = useChatStore();
  const { authUser } = useAuthStore();
  const { showMobileLayout } = useResponsive();
  
  const [loadingMore, setLoadingMore] = useState(false);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    await loadMoreResults();
    setLoadingMore(false);
  };

  const handleResultClick = (message) => {
    // Navigate to the chat and highlight the message
    if (message.messageType === "direct") {
      const otherUserId = message.senderId._id === authUser._id 
        ? message.receiverId._id 
        : message.senderId._id;
      
      const otherUser = message.senderId._id === authUser._id 
        ? message.receiverId 
        : message.senderId;
      
      setSelectedUser(otherUser);
    } else if (message.messageType === "group") {
      setSelectedGroup(message.groupId);
    }
    
    // Close search and navigate
    onResultClick?.(message);
    onClose?.();
  };

  const highlightSearchTerm = (text, query) => {
    if (!text || !query) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-yellow-900 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  const formatResultPreview = (message) => {
    if (message.file) {
      return `📎 ${message.file.originalName}`;
    } else if (message.image) {
      return "📷 Image";
    } else if (message.text) {
      return message.text;
    }
    return "Message";
  };

  const getMessageIcon = (message) => {
    if (message.messageType === "group") {
      return <Hash className="w-4 h-4 text-primary" />;
    }
    return <MessageSquare className="w-4 h-4 text-primary" />;
  };

  const getChatName = (message) => {
    if (message.messageType === "group") {
      return message.groupId?.name || "Unknown Group";
    } else {
      const isOwn = message.senderId._id === authUser._id;
      return isOwn ? message.receiverId?.fullName : message.senderId?.fullName;
    }
  };

  if (isSearching && searchResults.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        // components/SearchResults.jsx (continued)
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-base-content/70 text-center">
          Searching for "{searchQuery}"...
        </p>
      </div>
    );
  }

  if (!isSearching && searchResults.length === 0 && searchQuery) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="w-12 h-12 text-base-content/30 mb-4" />
        <h3 className="text-lg font-semibold text-base-content mb-2">
          No results found
        </h3>
        <p className="text-base-content/70 max-w-sm">
          Try adjusting your search terms or filters. You can search for text, file names, or use different message types.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-base-100">
      {/* Results List */}
      <div className="flex-1 overflow-y-auto">
        <div className={`space-y-1 ${showMobileLayout ? 'p-2' : 'p-4'}`}>
          {searchResults.map((message, index) => {
            const isOwn = message.senderId._id === authUser._id;
            const chatName = getChatName(message);
            const senderName = isOwn ? "You" : message.senderId?.fullName;
            
            return (
              <button
                key={`${message._id}-${index}`}
                onClick={() => handleResultClick(message)}
                className={`w-full p-3 rounded-lg border border-base-300 hover:border-primary hover:bg-base-50 transition-all duration-200 text-left group ${
                  showMobileLayout ? 'p-3' : 'p-4'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {getMessageIcon(message)}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium text-base-content truncate ${
                          showMobileLayout ? 'text-sm' : 'text-sm'
                        }`}>
                          {chatName}
                        </span>
                        {message.messageType === "group" && (
                          <span className={`text-base-content/60 ${
                            showMobileLayout ? 'text-xs' : 'text-xs'
                          }`}>
                            • {senderName}
                          </span>
                        )}
                      </div>
                      
                      {/* Date */}
                      <div className="flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3 text-base-content/50" />
                        <span className={`text-base-content/60 ${
                          showMobileLayout ? 'text-xs' : 'text-xs'
                        }`}>
                          {formatMessageTime(message.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <ChevronRight className="w-4 h-4 text-base-content/40 group-hover:text-primary flex-shrink-0 ml-2" />
                </div>

                {/* Message Content */}
                <div className="pl-6">
                  {/* File Preview */}
                  {message.file && (
                    <div className="mb-2">
                      <FileMessage 
                        file={message.file} 
                        isOwn={false}
                        isMobile={showMobileLayout}
                        compact={true}
                      />
                    </div>
                  )}
                  
                  {/* Legacy Image */}
                  {message.image && !message.file && (
                    <div className="mb-2">
                      <img
                        src={message.image}
                        alt="Search result"
                        className={`rounded-lg object-cover ${
                          showMobileLayout ? 'max-w-[120px] max-h-[120px]' : 'max-w-[150px] max-h-[150px]'
                        }`}
                      />
                    </div>
                  )}

                  {/* Text Content */}
                  {message.text && (
                    <p className={`text-base-content/80 leading-relaxed ${
                      showMobileLayout ? 'text-sm' : 'text-sm'
                    }`}>
                      {highlightSearchTerm(message.text, searchQuery)}
                    </p>
                  )}
                  
                  {/* Message Type Indicator */}
                  {message.messageSubType !== 'text' && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="badge badge-primary badge-sm">
                        {message.messageSubType}
                      </div>
                      {message.file?.originalName && (
                        <span className="text-xs text-base-content/60 truncate">
                          {highlightSearchTerm(message.file.originalName, searchQuery)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Load More Button */}
        {hasMoreResults && (
          <div className={`text-center ${showMobileLayout ? 'p-4' : 'p-6'}`}>
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="btn btn-outline btn-primary"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Loading...
                </>
              ) : (
                'Load More Results'
              )}
            </button>
          </div>
        )}

        {/* End of Results */}
        {!hasMoreResults && searchResults.length > 0 && (
          <div className={`text-center text-base-content/60 ${
            showMobileLayout ? 'p-4' : 'p-6'
          }`}>
            <p className="text-sm">
              {searchMode === "global" 
                ? `Found ${totalResults} result${totalResults !== 1 ? 's' : ''} across all conversations`
                : `Found ${totalResults} result${totalResults !== 1 ? 's' : ''} in this conversation`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;