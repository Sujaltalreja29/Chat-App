// components/SearchBar.jsx
import { useState, useEffect, useRef } from "react";
import { useSearchStore } from "../store/useSearchStore";
import { useChatStore } from "../store/useChatStore";
import { useResponsive } from "../hooks/useResponsive";
import { 
  Search, X, Filter, Clock, ArrowLeft, Loader2,
  FileText, Image, Video, Music, Mic, File
} from "lucide-react";

const SearchBar = ({ onClose, isMobile = false }) => {
  const {
    searchQuery,
    searchType,
    searchMode,
    searchResults,
    isSearching,
    searchHistory,
    searchSuggestions,
    totalResults,
    setSearchQuery,
    setSearchType,
    searchGlobal,
    searchInConversation,
    searchChats,
    loadSearchHistory,
    clearSearchHistory,
    getSearchSuggestions
  } = useSearchStore();
  
  const { selectedUser, selectedGroup, chatType } = useChatStore();
  const { showMobileLayout } = useResponsive();
  
  const [showFilters, setShowFilters] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [chatSearchResults, setChatSearchResults] = useState({ friends: [], groups: [] });
  const [searchFocus, setSearchFocus] = useState(false);
  
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  // Load search history and suggestions on mount
  useEffect(() => {
    loadSearchHistory();
    getSearchSuggestions();
  }, []);

  // Auto-focus input when search bar opens
  useEffect(() => {
    if (inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (searchQuery.trim().length >= 2) {
      debounceRef.current = setTimeout(() => {
        handleSearch();
      }, 300);
    } else if (searchQuery.trim().length === 0) {
      setShowHistory(true);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery, searchType, searchMode]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setShowHistory(false);

    if (searchMode === "global") {
      // components/SearchBar.jsx (continued)
      await searchGlobal(searchQuery, searchType);
    } else if (searchMode === "conversation") {
      const chatId = chatType === "group" ? selectedGroup?._id : selectedUser?._id;
      if (chatId) {
        await searchInConversation(searchQuery, chatId, chatType, searchType);
      }
    }

    // Also search chats for quick navigation
    if (searchMode === "global") {
      const chatResults = await searchChats(searchQuery);
      setChatSearchResults(chatResults);
    }
  };

  const handleQueryChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.trim().length === 0) {
      setShowHistory(true);
      setChatSearchResults({ friends: [], groups: [] });
    }
  };

  const handleHistoryClick = (query) => {
    setSearchQuery(query);
    setShowHistory(false);
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion === "images") setSearchType("image");
    else if (suggestion === "documents") setSearchType("document");
    else if (suggestion === "voice messages") setSearchType("voice");
    else setSearchQuery(suggestion);
    setShowHistory(false);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "text": return <FileText className="w-4 h-4" />;
      case "image": return <Image className="w-4 h-4" />;
      case "video": return <Video className="w-4 h-4" />;
      case "audio": return <Music className="w-4 h-4" />;
      case "voice": return <Mic className="w-4 h-4" />;
      case "document": return <File className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  const searchTypes = [
    { value: "all", label: "All", icon: <Search className="w-4 h-4" /> },
    { value: "text", label: "Text", icon: <FileText className="w-4 h-4" /> },
    { value: "image", label: "Images", icon: <Image className="w-4 h-4" /> },
    { value: "document", label: "Docs", icon: <File className="w-4 h-4" /> },
    { value: "voice", label: "Voice", icon: <Mic className="w-4 h-4" /> },
    { value: "audio", label: "Audio", icon: <Music className="w-4 h-4" /> },
    { value: "video", label: "Video", icon: <Video className="w-4 h-4" /> }
  ];

  return (
    <div className={`bg-base-100 border-b border-base-300 ${
      showMobileLayout ? 'fixed top-0 left-0 right-0 z-50' : ''
    }`}>
      {/* Search Header */}
      <div className={`flex items-center gap-3 ${
        showMobileLayout ? 'p-4 pb-2' : 'p-4'
      }`}>
        {/* Back Button (Mobile) */}
        {showMobileLayout && (
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        {/* Search Input */}
        <div className="flex-1 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-base-content/50" />
            <input
              ref={inputRef}
              type="text"
              placeholder={`Search ${searchMode === "conversation" 
                ? `in ${chatType === "group" ? selectedGroup?.name : selectedUser?.fullName}` 
                : "messages"
              }...`}
              value={searchQuery}
              onChange={handleQueryChange}
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setTimeout(() => setSearchFocus(false), 200)}
              className={`input input-bordered w-full pl-10 pr-10 ${
                showMobileLayout ? 'input-sm' : ''
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setShowHistory(true);
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 btn btn-ghost btn-xs btn-circle"
              >
                <X className="w-3 h-3" />
              </button>
            )}
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              </div>
            )}
          </div>
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn btn-ghost btn-sm ${showFilters ? 'btn-active' : ''}`}
        >
          <Filter className="w-4 h-4" />
          {!showMobileLayout && <span className="ml-1">Filter</span>}
        </button>

        {/* Close Button (Desktop) */}
        {!showMobileLayout && (
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Filters */}
      {showFilters && (
        <div className={`border-t border-base-300 ${
          showMobileLayout ? 'px-4 py-2' : 'px-4 py-3'
        }`}>
          <div className="flex flex-wrap gap-2">
            {searchTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setSearchType(type.value)}
                className={`btn btn-sm ${
                  searchType === type.value ? 'btn-primary' : 'btn-outline'
                }`}
              >
                {type.icon}
                <span className="ml-1">{type.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Results Summary */}
      {searchQuery && !isSearching && (
        <div className={`border-t border-base-300 ${
          showMobileLayout ? 'px-4 py-2' : 'px-4 py-2'
        }`}>
          <p className="text-sm text-base-content/70">
            {totalResults > 0 
              ? `Found ${totalResults} result${totalResults !== 1 ? 's' : ''} for "${searchQuery}"`
              : `No results found for "${searchQuery}"`
            }
          </p>
        </div>
      )}

      {/* Search History & Suggestions */}
      {showHistory && searchFocus && (searchHistory.length > 0 || searchSuggestions.length > 0) && (
        <div className={`border-t border-base-300 bg-base-50 ${
          showMobileLayout ? 'max-h-60' : 'max-h-80'
        } overflow-y-auto`}>
          
          {/* Recent Searches */}
          {searchHistory.length > 0 && (
            <div className={showMobileLayout ? 'p-3' : 'p-4'}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-base-content/80 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Recent Searches
                </h4>
                <button
                  onClick={clearSearchHistory}
                  className="text-xs text-base-content/60 hover:text-base-content"
                >
                  Clear
                </button>
              </div>
              <div className="space-y-1">
                {searchHistory.map((query, index) => (
                  <button
                    key={index}
                    onClick={() => handleHistoryClick(query)}
                    className="block w-full text-left px-2 py-1 rounded text-sm text-base-content/70 hover:bg-base-200 hover:text-base-content"
                  >
                    {query}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Suggestions */}
          {searchSuggestions.length > 0 && (
            <div className={`${searchHistory.length > 0 ? 'border-t border-base-300' : ''} ${
              showMobileLayout ? 'p-3' : 'p-4'
            }`}>
              <h4 className="text-sm font-medium text-base-content/80 mb-2">
                Suggestions
              </h4>
              <div className="flex flex-wrap gap-2">
                {searchSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="btn btn-xs btn-outline"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Chat Results */}
      {searchMode === "global" && searchQuery && (chatSearchResults.friends.length > 0 || chatSearchResults.groups.length > 0) && (
        <div className={`border-t border-base-300 bg-base-50 ${
          showMobileLayout ? 'p-3' : 'p-4'
        }`}>
          <h4 className="text-sm font-medium text-base-content/80 mb-2">Quick Access</h4>
          <div className="space-y-2">
            {/* Friends */}
            {chatSearchResults.friends.map((friend) => (
              <button
                key={friend._id}
                onClick={() => {
                  // Handle chat selection
                  onClose();
                  // You'll need to implement this navigation
                }}
                className="flex items-center gap-2 w-full p-2 rounded hover:bg-base-200 text-left"
              >
                <img
                  src={friend.profilePic || "/avatar.png"}
                  alt={friend.fullName}
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-sm">{friend.fullName}</span>
              </button>
            ))}
            
            {/* Groups */}
            {chatSearchResults.groups.map((group) => (
              <button
                key={group._id}
                onClick={() => {
                  // Handle group selection
                  onClose();
                  // You'll need to implement this navigation
                }}
                className="flex items-center gap-2 w-full p-2 rounded hover:bg-base-200 text-left"
              >
                <div className="w-6 h-6 bg-primary text-primary-content rounded-full flex items-center justify-center text-xs">
                  #
                </div>
                <span className="text-sm">{group.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;