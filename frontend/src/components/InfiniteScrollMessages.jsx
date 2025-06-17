// src/components/InfiniteScrollMessages.jsx
import { useEffect, useRef, useCallback } from 'react';
import { useIntersection } from '../hooks/useIntersection';
import { useResponsive } from '../hooks/useResponsive';

const InfiniteScrollMessages = ({ 
  children, 
  hasMore, 
  isLoadingMore, 
  onLoadMore,
  className = ""
}) => {
  const scrollRef = useRef(null);
  const topRef = useRef(null);
  const bottomRef = useRef(null);
  const lastScrollHeight = useRef(0);
  const isAtBottom = useRef(true);
  
  const { isMobile } = useResponsive();

  // Intersection observer for top of messages (load more trigger)
  const [topInView] = useIntersection(topRef, {
    threshold: 0.1,
    rootMargin: isMobile ? '50px' : '100px' // Smaller margin on mobile
  });

  // Handle loading more messages when scrolled to top
  useEffect(() => {
    if (topInView && hasMore && !isLoadingMore) {
      console.log('📜 Loading more messages...');
      onLoadMore();
    }
  }, [topInView, hasMore, isLoadingMore, onLoadMore]);

  // Maintain scroll position when new messages are loaded at the top
  useEffect(() => {
    if (scrollRef.current && isLoadingMore) {
      lastScrollHeight.current = scrollRef.current.scrollHeight;
    }
  }, [isLoadingMore]);

  useEffect(() => {
    if (scrollRef.current && !isLoadingMore && lastScrollHeight.current > 0) {
      const newScrollHeight = scrollRef.current.scrollHeight;
      const heightDifference = newScrollHeight - lastScrollHeight.current;
      
      if (heightDifference > 0) {
        scrollRef.current.scrollTop = heightDifference;
      }
      
      lastScrollHeight.current = 0;
    }
  }, [isLoadingMore]);

  // Auto-scroll to bottom for new messages
  const scrollToBottom = useCallback((smooth = true) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'instant'
      });
    }
  }, []);

  // Track if user is at bottom (more sensitive on mobile)
  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const threshold = isMobile ? 50 : 100; // Smaller threshold on mobile
      isAtBottom.current = scrollHeight - scrollTop - clientHeight < threshold;
    }
  }, [isMobile]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (isAtBottom.current) {
      scrollToBottom();
    }
  }, [children, scrollToBottom]);

  return (
    <div 
      ref={scrollRef}
      className={`flex-1 overflow-y-auto scroll-smooth-mobile ${
        isMobile ? 'px-3 py-3' : 'px-4 py-4'
      } ${className}`}
      onScroll={handleScroll}
    >
      {/* Load more trigger */}
      {hasMore && (
        <div ref={topRef} className="h-1 -mt-1">
          {isLoadingMore && (
            <div className={`flex justify-center ${isMobile ? 'py-2' : 'py-4'}`}>
              <div className="flex items-center gap-2 text-base-content/60">
                <div className={`animate-spin rounded-full border-b-2 border-primary ${
                  isMobile ? 'h-3 w-3' : 'h-4 w-4'
                }`}></div>
                <span className={isMobile ? 'text-xs' : 'text-sm'}>
                  Loading more messages...
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Messages */}
      <div className={isMobile ? 'space-y-3' : 'space-y-4'}>
        {children}
      </div>

      {/* Bottom reference */}
      <div ref={bottomRef} className="h-1" />
    </div>
  );
};

export default InfiniteScrollMessages;