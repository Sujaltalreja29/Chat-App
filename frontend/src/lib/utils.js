// lib/utils.js - ADD date separator formatting

export const formatDateSeparator = (date) => {
  if (!date) return '';
  
  const messageDate = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Reset time part for accurate comparison
  const messageDateOnly = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
  
  if (messageDateOnly.getTime() === todayOnly.getTime()) {
    return 'Today';
  } else if (messageDateOnly.getTime() === yesterdayOnly.getTime()) {
    return 'Yesterday';
  } else {
    // Check if it's within the last week
    const diffTime = today - messageDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7) {
      // Show day name (e.g., "Monday", "Tuesday")
      return messageDate.toLocaleDateString('en-US', { weekday: 'long' });
    } else if (messageDate.getFullYear() === today.getFullYear()) {
      // Same year: show "Month Day" (e.g., "March 15")
      return messageDate.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric' 
      });
    } else {
      // Different year: show "Month Day, Year" (e.g., "March 15, 2023")
      return messageDate.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric',
        year: 'numeric'
      });
    }
  }
};

// Keep your existing formatMessageTime function, but you can simplify it:
export const formatMessageTime = (date) => {
  if (!date) return '';
  
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

// lib/utils.js - ADD helper to check if dates are different days

export const isSameDay = (date1, date2) => {
  if (!date1 || !date2) return false;
  
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

export const shouldShowDateSeparator = (currentMessage, previousMessage) => {
  if (!previousMessage) return true; // Show date for first message
  
  return !isSameDay(currentMessage.createdAt, previousMessage.createdAt);
};