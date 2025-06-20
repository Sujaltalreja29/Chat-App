// store/useSearchStore.js - Only critical fixes
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useSearchStore = create((set, get) => ({
  searchQuery: "",
  globalSearchResults: [],
  conversationSearchResults: [],
  searchType: "all",
  isSearching: false,
  searchMode: "none",
  currentChatId: null,
    currentChatType: "direct",
  showGlobalSearch: false,
  showConversationSearch: false,
  searchHistory: [],
  searchSuggestions: [],
  currentPage: 1,
  totalResults: 0,
  hasMoreResults: false,
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  setSearchType: (type) => set({ searchType: type, currentPage: 1 }),
  
  toggleGlobalSearch: () => {
    const { showGlobalSearch } = get();
    set({ 
      showGlobalSearch: !showGlobalSearch,
      showConversationSearch: false,
      searchMode: !showGlobalSearch ? "global" : "none",
      searchQuery: !showGlobalSearch ? get().searchQuery : "",
      globalSearchResults: !showGlobalSearch ? get().globalSearchResults : []
    });
  },
  
  toggleConversationSearch: (chatId = null, chatType = "direct") => {
    const { showConversationSearch } = get();
    set({ 
      showConversationSearch: !showConversationSearch,
      showGlobalSearch: false,
      searchMode: !showConversationSearch ? "conversation" : "none",
      currentChatId: chatId,
      currentChatType: chatType,
      searchQuery: !showConversationSearch ? get().searchQuery : "",
      conversationSearchResults: !showConversationSearch ? get().conversationSearchResults : []
    });
  },
  
  searchGlobal: async (query, type = "all", page = 1) => {
    if (!query || query.trim().length < 2) {
      set({ globalSearchResults: [], totalResults: 0, hasMoreResults: false });
      return;
    }
    
    set({ isSearching: true });
    
    try {
      const response = await axiosInstance.get("/search/messages", {
        params: { q: query.trim(), type, page, limit: 20 }
      });
      
      const { messages, pagination } = response.data;
      
      if (page === 1) {
        set({
          globalSearchResults: messages,
          currentPage: page,
          totalResults: pagination.totalResults,
          hasMoreResults: pagination.hasMore
        });
      } else {
        set({
          globalSearchResults: [...get().globalSearchResults, ...messages],
          currentPage: page,
          hasMoreResults: pagination.hasMore
        });
      }
      
      get().addToSearchHistory(query);
      
    } catch (error) {
      console.error("Global search failed:", error);
      // 🔧 FIX: Added null checks
      toast.error(error.response?.data?.error || "Search failed. Please try again.");
      set({ globalSearchResults: [], totalResults: 0, hasMoreResults: false });
    } finally {
      set({ isSearching: false });
    }
  },
  
  searchInConversation: async (query, chatId, chatType, type = "all") => {
    if (!query || query.trim().length < 2) {
      set({ conversationSearchResults: [], totalResults: 0 });
      return;
    }
    
    set({ isSearching: true });
    
    try {
      const response = await axiosInstance.get(`/search/conversation/${chatId}`, {
        params: { q: query.trim(), type, chatType, limit: 50 }
      });
      
      const { messages } = response.data;
      
      set({
        conversationSearchResults: messages,
        totalResults: messages.length,
        hasMoreResults: false,
        currentPage: 1
      });
      
      get().addToSearchHistory(query);
      
    } catch (error) {
      console.error("Conversation search failed:", error);
      // 🔧 FIX: Added null checks
      toast.error(error.response?.data?.error || "Search failed. Please try again.");
      set({ conversationSearchResults: [], totalResults: 0 });
    } finally {
      set({ isSearching: false });
    }
  },
  
  searchChats: async (query) => {
    if (!query || query.trim().length < 2) {
      return { friends: [], groups: [] };
    }
    
    try {
      const response = await axiosInstance.get("/search/chats", {
        params: { q: query.trim() }
      });
      return response.data;
    } catch (error) {
      console.error("Chat search failed:", error);
      return { friends: [], groups: [] };
    }
  },
  
  addToSearchHistory: (query) => {
    const { searchHistory } = get();
    const trimmedQuery = query.trim();
    
    if (!trimmedQuery || searchHistory.includes(trimmedQuery)) return;
    
    const newHistory = [trimmedQuery, ...searchHistory.filter(q => q !== trimmedQuery)].slice(0, 10);
    set({ searchHistory: newHistory });
    
    // 🔧 FIX: Added error handling for localStorage
    try {
      localStorage.setItem("chatty_search_history", JSON.stringify(newHistory));
    } catch (error) {
      console.error("Failed to save search history:", error);
    }
  },
  
  loadSearchHistory: () => {
    try {
      const saved = localStorage.getItem("chatty_search_history");
      if (saved) {
        set({ searchHistory: JSON.parse(saved) });
      }
    } catch (error) {
      console.error("Failed to load search history:", error);
      set({ searchHistory: [] }); // 🔧 FIX: Reset to empty array on error
    }
  },
  
  clearSearch: () => {
    set({
      searchQuery: "",
      globalSearchResults: [],
      conversationSearchResults: [],
      searchType: "all",
      currentPage: 1,
      totalResults: 0,
      hasMoreResults: false,
      showGlobalSearch: false,
      showConversationSearch: false,
      searchMode: "none"
    });
  }
}));