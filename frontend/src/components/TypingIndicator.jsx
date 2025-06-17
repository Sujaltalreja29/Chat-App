// src/components/TypingIndicator.jsx
import { useEffect, useState } from 'react';

const TypingIndicator = ({ typingUsers, chatType, isMobile = false }) => {
  const [dots, setDots] = useState('');

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

  const formatTypingText = () => {
    if (typingUsers.length === 1) {
      const name = isMobile 
        ? typingUsers[0].fullName.split(' ')[0] // First name only on mobile
        : typingUsers[0].fullName;
      return `${name} is typing${dots}`;
    } else if (typingUsers.length === 2) {
      const name1 = isMobile ? typingUsers[0].fullName.split(' ')[0] : typingUsers[0].fullName;
      const name2 = isMobile ? typingUsers[1].fullName.split(' ')[0] : typingUsers[1].fullName;
      return `${name1} and ${name2} are typing${dots}`;
    } else if (typingUsers.length === 3) {
      const name1 = isMobile ? typingUsers[0].fullName.split(' ')[0] : typingUsers[0].fullName;
      const name2 = isMobile ? typingUsers[1].fullName.split(' ')[0] : typingUsers[1].fullName;
      const name3 = isMobile ? typingUsers[2].fullName.split(' ')[0] : typingUsers[2].fullName;
      return `${name1}, ${name2} and ${name3} are typing${dots}`;
    } else {
      const name1 = isMobile ? typingUsers[0].fullName.split(' ')[0] : typingUsers[0].fullName;
      const name2 = isMobile ? typingUsers[1].fullName.split(' ')[0] : typingUsers[1].fullName;
      return `${name1}, ${name2} and ${typingUsers.length - 2} others are typing${dots}`;
    }
  };

  return (
    <div className={`bg-base-100 border-t border-base-300 ${
      isMobile ? 'px-3 py-2' : 'px-4 py-2'
    }`}>
      <div className="flex items-center gap-2">
        {/* Animated typing indicator */}
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`bg-primary rounded-full animate-bounce ${
                isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'
              }`}
              style={{ animationDelay: `${i * 0.1}s` }}
            ></div>
          ))}
        </div>
        
        {/* Typing text */}
        <span className={`text-base-content/70 italic ${
          isMobile ? 'text-xs' : 'text-sm'
        }`}>
          {formatTypingText()}
        </span>
      </div>
    </div>
  );
};

export default TypingIndicator;