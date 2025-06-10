// Update your existing ChatContainer.jsx to support groups
import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { CheckCheck, MessageSquare, Hash } from "lucide-react";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    selectedGroup,
    subscribeToMessages,
    unsubscribeFromMessages,
    chatType
  } = useChatStore();
  
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (chatType === 'direct' && selectedUser && messages.length === 0) {
      getMessages(selectedUser._id, 'direct');
    } else if (chatType === 'group' && selectedGroup && messages.length === 0) {
      getMessages(selectedGroup._id, 'group');
    }

    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser, selectedGroup, chatType]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col h-full bg-base-100">
        <ChatHeader />
        <div className="flex-1 overflow-hidden">
          <MessageSkeleton />
        </div>
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-base-100">
      {/* Fixed Header */}
      <ChatHeader />

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto bg-base-200 px-4 py-4">
        {messages.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-base-300 rounded-full flex items-center justify-center mb-4">
              {chatType === 'group' ? (
                <Hash className="w-8 h-8 text-base-content/50" />
              ) : (
                <MessageSquare className="w-8 h-8 text-base-content/50" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-base-content mb-2">
              No messages yet
            </h3>
            <p className="text-base-content/70 max-w-sm">
              {chatType === 'group' && selectedGroup ? (
                <>Start the conversation in <span className="font-medium text-base-content">{selectedGroup.name}</span></>
              ) : selectedUser ? (
                <>Start the conversation with <span className="font-medium text-base-content">{selectedUser.fullName}</span></>
              ) : (
                'Select a chat to start messaging'
              )}
            </p>
          </div>
        ) : (
          /* Messages List */
          <div className="space-y-4">
            {messages.map((message, index) => {
              const isOwn = message.senderId._id === authUser._id;
              const showAvatar = index === 0 || messages[index - 1].senderId._id !== message.senderId._id;
              const showSenderName = chatType === 'group' && !isOwn && showAvatar;

              return (
                <div
                  key={message._id}
                  className={`flex gap-3 ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Avatar - Left side for others */}
                  {!isOwn && (
                    <div className="flex-shrink-0 self-end">
                      {showAvatar ? (
                        <img
                          src={message.senderId.profilePic || "/avatar.png"}
                          alt={message.senderId.fullName}
                          className="w-8 h-8 rounded-full object-cover border-2 border-base-100 shadow-sm"
                        />
                      ) : (
                        <div className="w-8 h-8"></div>
                      )}
                    </div>
                  )}

                  {/* Message Content */}
                  <div className={`flex flex-col max-w-[75%] sm:max-w-[60%] ${isOwn ? 'items-end' : 'items-start'}`}>
                    
                    {/* Sender Name for Groups */}
                    {showSenderName && (
                      <div className="mb-1 ml-2">
                        <span className="text-xs font-semibold text-base-content/80">
                          {message.senderId.fullName}
                        </span>
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div
                      className={`relative px-4 py-3 rounded-2xl shadow-sm ${
                        isOwn
                          ? 'bg-primary text-primary-content rounded-br-md'
                          : 'bg-base-100 text-base-content border border-base-300 rounded-bl-md'
                      }`}
                    >
                      {/* Image Message */}
                      {message.image && (
                        <div className={message.text ? "mb-3" : ""}>
                          <img
                            src={message.image}
                            alt="Shared image"
                            className="max-w-[250px] w-full rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(message.image, '_blank')}
                          />
                        </div>
                      )}

                      {/* Text Message */}
                      {message.text && (
                        <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                          {message.text}
                        </p>
                      )}

                      {/* Message Time - Inside bubble for own messages */}
                      {isOwn && (
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <time className="text-xs text-primary-content/70">
                            {formatMessageTime(message.createdAt)}
                          </time>
                          <div className="text-primary-content/70">
                            <CheckCheck className="w-3 h-3" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Message Time - Outside bubble for received messages */}
                    {!isOwn && (
                      <div className="mt-1 ml-2">
                        <time className="text-xs text-base-content/60">
                          {formatMessageTime(message.createdAt)}
                        </time>
                      </div>
                    )}
                  </div>

                  {/* Avatar - Right side for own messages */}
                  {isOwn && (
                    <div className="flex-shrink-0 self-end">
                      {showAvatar ? (
                        <img
                          src={authUser.profilePic || "/avatar.png"}
                          alt={authUser.fullName}
                          className="w-8 h-8 rounded-full object-cover border-2 border-base-100 shadow-sm"
                        />
                      ) : (
                        <div className="w-8 h-8"></div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messageEndRef} className="h-1" />
          </div>
        )}
      </div>

      {/* Fixed Input at Bottom */}
      <div className="border-t border-base-300 bg-base-100">
        <MessageInput />
      </div>
    </div>
  );
};

export default ChatContainer;