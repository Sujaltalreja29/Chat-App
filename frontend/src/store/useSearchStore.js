// store/useSearchStore.js - UPDATE THE EXISTING STORE
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useSearchStore = create((set, get) => ({
  // Search state
  searchQuery: "",
  globalSearchResults: [],
  conversationSearchResults: [],
  searchType: "all",
  isSearching: false,
  searchMode: "none", // none, global, conversation
  currentChatId: null,
  currentChatType: "direct",
  
  // UI state - SIMPLIFIED
  showGlobalSearch: false,
  showConversationSearch: false,
  searchHistory: [],
  searchSuggestions: [],
  
  // Results pagination
  currentPage: 1,
  totalResults: 0,
  hasMoreResults: false,
  
  // UPDATED Actions
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  setSearchType: (type) => set({ searchType: type, currentPage: 1 }),
  
  // NEW: Toggle global search in sidebar
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
  
  // NEW: Toggle conversation search in chat
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
  
  // UPDATED: Global search for sidebar
searchGlobal: async (query, type = "all", page = 1) => {
  if (!query || query.trim().length < 2) {
    set({ globalSearchResults: [], totalResults: 0, hasMoreResults: false });
    return;
  }
  
  console.log(`🔍 Frontend: Searching for "${query}" (type: ${type}, page: ${page})`);
  set({ isSearching: true });
  
  try {
    const response = await axiosInstance.get("/search/messages", {
      params: { q: query.trim(), type, page, limit: 20 }
    });
    
    console.log(`✅ Frontend: Search response:`, response.data);
    
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
    console.error("❌ Frontend: Global search failed:", error);
    console.error("❌ Error response:", error.response?.data);
    toast.error("Search failed. Please try again.");
    set({ globalSearchResults: [], totalResults: 0, hasMoreResults: false });
  } finally {
    set({ isSearching: false });
  }
},
  
  // UPDATED: Conversation search for chat container
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
      toast.error("Search failed. Please try again.");
      set({ conversationSearchResults: [], totalResults: 0 });
    } finally {
      set({ isSearching: false });
    }
  },
  
  // Rest of your existing functions...
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
    localStorage.setItem("chatty_search_history", JSON.stringify(newHistory));
  },
  
  loadSearchHistory: () => {
    try {
      const saved = localStorage.getItem("chatty_search_history");
      if (saved) {
        set({ searchHistory: JSON.parse(saved) });
      }
    } catch (error) {
      console.error("Failed to load search history:", error);
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