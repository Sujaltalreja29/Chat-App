import { useEffect, useRef, useCallback } from 'react';
import { useIntersection } from '../hooks/useIntersection';

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

  // Intersection observer for top of messages (load more trigger)
  const [topInView] = useIntersection(topRef, {
    threshold: 0.1,
    rootMargin: '100px'
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

  // Auto-scroll to bottom for new messages (only if user is near bottom)
  const scrollToBottom = useCallback((smooth = true) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'instant'
      });
    }
  }, []);

  // Track if user is at bottom
  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const threshold = 100; // pixels from bottom
      isAtBottom.current = scrollHeight - scrollTop - clientHeight < threshold;
    }
  }, []);

  // Scroll to bottom when new messages arrive (only if user was at bottom)
  useEffect(() => {
    if (isAtBottom.current) {
      scrollToBottom();
    }
  }, [children, scrollToBottom]);

  return (
    <div 
      ref={scrollRef}
      className={`flex-1 overflow-y-auto px-4 py-4 ${className}`}
      onScroll={handleScroll}
    >
      {/* Load more trigger */}
      {hasMore && (
        <div ref={topRef} className="h-1 -mt-1">
          {isLoadingMore && (
            <div className="flex justify-center py-4">
              <div className="flex items-center gap-2 text-sm text-base-content/60">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                Loading more messages...
              </div>
            </div>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="space-y-4">
        {children}
      </div>

      {/* Bottom reference */}
      <div ref={bottomRef} className="h-1" />
    </div>
  );
};

export default InfiniteScrollMessages;