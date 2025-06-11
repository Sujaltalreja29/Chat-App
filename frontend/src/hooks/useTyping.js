import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';

const useTyping = (chatId, chatType) => {
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const { socket, authUser } = useAuthStore();
  const typingTimeoutRef = useRef(null);
  const lastTypingTime = useRef(0);

  // Debounced typing function
  const handleTyping = useCallback((inputValue) => {
    if (!socket || !chatId || !authUser) return;

    const now = Date.now();
    const timeSinceLastTyping = now - lastTypingTime.current;

    // Only emit if it's been more than 500ms since last typing event
    if (timeSinceLastTyping > 500) {
      setIsTyping(true);
      
      socket.emit('typing', {
        chatId,
        chatType,
        isTyping: true,
        userInfo: {
          userId: authUser._id,
          fullName: authUser.fullName,
          profilePic: authUser.profilePic
        }
      });

      lastTypingTime.current = now;
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      
      socket.emit('typing', {
        chatId,
        chatType,
        isTyping: false,
        userInfo: {
          userId: authUser._id,
          fullName: authUser.fullName,
          profilePic: authUser.profilePic
        }
      });
    }, 2000);
  }, [socket, chatId, chatType, authUser]);

  // Stop typing when user stops typing
  const stopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    if (isTyping) {
      setIsTyping(false);
      
      if (socket) {
        socket.emit('typing', {
          chatId,
          chatType,
          isTyping: false,
          userInfo: {
            userId: authUser._id,
            fullName: authUser.fullName,
            profilePic: authUser.profilePic
          }
        });
      }
    }
  }, [isTyping, socket, chatId, chatType, authUser]);

  // Listen for typing updates from other users
  useEffect(() => {
    if (!socket) return;

    const handleTypingUpdate = (data) => {
      if (data.chatId === chatId) {
        // Filter out current user from typing users
        const otherTypingUsers = data.typingUsers.filter(
          user => user.userId !== authUser?._id
        );
        setTypingUsers(otherTypingUsers);
      }
    };

    socket.on('typingUpdate', handleTypingUpdate);

    // Join group room if it's a group chat
    if (chatType === 'group' && chatId) {
      const groupId = chatId.split(':')[1];
      socket.emit('joinGroup', { groupId });
    }

    return () => {
      socket.off('typingUpdate', handleTypingUpdate);
      
      // Leave group room
      if (chatType === 'group' && chatId) {
        const groupId = chatId.split(':')[1];
        socket.emit('leaveGroup', { groupId });
      }
      
      // Clean up typing state
      stopTyping();
    };
  }, [socket, chatId, chatType, authUser, stopTyping]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    isTyping,
    typingUsers,
    handleTyping,
    stopTyping
  };
};

export default useTyping;