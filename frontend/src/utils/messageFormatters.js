import { getFileDisplayInfo } from '../constants/fileTypes';

export const formatLastMessage = (lastMessage, isGroup = false, authUserId = null) => {
  if (!lastMessage) return '';
  
  const isOwn = lastMessage.senderId._id === authUserId;
  const senderName = isOwn ? 'You' : (isGroup ? lastMessage.senderId.fullName : '');
  
  let messageContent = '';
  
  // Handle file uploads
  if (lastMessage.file) {
    const fileInfo = getFileDisplayInfo(lastMessage.file.fileType);
    const fileName = lastMessage.file.originalName;
    
    messageContent = `${fileInfo.icon} ${fileInfo.label}`;
    
    // Add file name if it's short and meaningful
    if (fileName && fileName.length <= 25) {
      const extension = fileName.split('.').pop();
      messageContent += `: ${fileName}`;
    }
  }
  // Legacy image support
  else if (lastMessage.image) {
    messageContent = '📷 Photo';
  }
  // Text message
  else if (lastMessage.text) {
    messageContent = lastMessage.text.length > 35 
      ? lastMessage.text.substring(0, 35) + '...' 
      : lastMessage.text;
  }
  
  return isGroup && senderName 
    ? `${senderName}: ${messageContent}`
    : messageContent;
};

export const formatMessageTime = (date) => {
  if (!date) return '';
  
  const now = new Date();
  const messageDate = new Date(date);
  const diffTime = now - messageDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return messageDate.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return messageDate.toLocaleDateString('en-US', { weekday: 'short' });
  } else {
    return messageDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }
};