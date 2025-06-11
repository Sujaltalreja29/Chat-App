import { useState, useCallback, useRef } from 'react';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

const usePagination = (chatId, chatType) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [pagination, setPagination] = useState(null);
  const loadedPages = useRef(new Set());
  const messagesCache = useRef(new Map());

  // Reset pagination state when chat changes
  const resetPagination = useCallback(() => {
    setMessages([]);
    setIsLoading(false);
    setIsLoadingMore(false);
    setHasMore(true);
    setPagination(null);
    loadedPages.current.clear();
    messagesCache.current.clear();
  }, []);

  // Load initial messages
  const loadMessages = useCallback(async (page = 1, limit = 50) => {
    if (!chatId) return;

    setIsLoading(true);
    try {
      let response;
      
      if (chatType === 'group') {
        response = await axiosInstance.get(`/groups/${chatId}/messages`, {
          params: { page, limit }
        });
      } else {
        response = await axiosInstance.get(`/messages/${chatId}`, {
          params: { page, limit }
        });
      }

      const { messages: newMessages, pagination: paginationInfo } = response.data;
      
      setMessages(newMessages);
      setPagination(paginationInfo);
      setHasMore(paginationInfo?.hasMore || false);
      loadedPages.current.add(page);

      // Cache messages
      const cacheKey = `${chatId}-${chatType}`;
      messagesCache.current.set(cacheKey, {
        messages: newMessages,
        pagination: paginationInfo,
        timestamp: Date.now()
      });

      console.log(`📜 Loaded ${newMessages.length} messages for ${chatType} chat: ${chatId}`);
    } catch (error) {
      console.error('Failed to load messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  }, [chatId, chatType]);

  // Load more messages (infinite scroll)
  const loadMoreMessages = useCallback(async (limit = 50) => {
    if (!chatId || !hasMore || isLoadingMore || messages.length === 0) return;

    setIsLoadingMore(true);
    try {
      // Get the timestamp of the oldest message
      const oldestMessage = messages[0];
      const beforeTimestamp = oldestMessage.createdAt;

      let response;
      
      if (chatType === 'group') {
        response = await axiosInstance.get(`/groups/${chatId}/messages/before`, {
          params: { before: beforeTimestamp, limit }
        });
      } else {
        response = await axiosInstance.get(`/messages/${chatId}/before`, {
          params: { before: beforeTimestamp, limit }
        });
      }

      const { messages: olderMessages, hasMore: moreAvailable } = response.data;
      
      if (olderMessages.length > 0) {
        // Prepend older messages to the beginning
        setMessages(prevMessages => [...olderMessages, ...prevMessages]);
        console.log(`📜 Loaded ${olderMessages.length} more messages`);
      }
      
      setHasMore(moreAvailable);
    } catch (error) {
      console.error('Failed to load more messages:', error);
      toast.error('Failed to load more messages');
    } finally {
      setIsLoadingMore(false);
    }
  }, [chatId, chatType, hasMore, isLoadingMore, messages]);

  // Add new message to the list
  const addMessage = useCallback((newMessage) => {
    setMessages(prevMessages => [...prevMessages, newMessage]);
  }, []);

  // Update existing message
  const updateMessage = useCallback((messageId, updates) => {
    setMessages(prevMessages => 
      prevMessages.map(msg => 
        msg._id === messageId ? { ...msg, ...updates } : msg
      )
    );
  }, []);

  // Remove message
  const removeMessage = useCallback((messageId) => {
    setMessages(prevMessages => 
      prevMessages.filter(msg => msg._id !== messageId)
    );
  }, []);

  // Get cached messages if available
  const getCachedMessages = useCallback(() => {
    const cacheKey = `${chatId}-${chatType}`;
    const cached = messagesCache.current.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) { // 5 minutes cache
      setMessages(cached.messages);
      setPagination(cached.pagination);
      setHasMore(cached.pagination?.hasMore || false);
      return true;
    }
    
    return false;
  }, [chatId, chatType]);

  return {
    messages,
    isLoading,
    isLoadingMore,
    hasMore,
    pagination,
    loadMessages,
    loadMoreMessages,
    addMessage,
    updateMessage,
    removeMessage,
    resetPagination,
    getCachedMessages
  };
};

export default usePagination;