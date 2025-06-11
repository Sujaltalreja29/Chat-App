import { useEffect, useState } from 'react';

const TypingIndicator = ({ typingUsers, chatType }) => {
  const [dots, setDots] = useState('');

  // Animated dots effect
  useEffect(() => {
    if (typingUsers.length === 0) return;

    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, [typingUsers.length]);

  if (typingUsers.length === 0) return null;

  // Format typing users display
  const formatTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0].fullName} is typing${dots}`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0].fullName} and ${typingUsers[1].fullName} are typing${dots}`;
    } else if (typingUsers.length === 3) {
      return `${typingUsers[0].fullName}, ${typingUsers[1].fullName} and ${typingUsers[2].fullName} are typing${dots}`;
    } else {
      return `${typingUsers[0].fullName}, ${typingUsers[1].fullName} and ${typingUsers.length - 2} others are typing${dots}`;
    }
  };

  return (
    <div className="px-4 py-2 bg-base-100 border-t border-base-300">
      <div className="flex items-center gap-2">
        {/* Animated typing indicator */}
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        
        {/* Typing text */}
        <span className="text-sm text-base-content/70 italic">
          {formatTypingText()}
        </span>
      </div>
    </div>
  );
};

export default TypingIndicator;