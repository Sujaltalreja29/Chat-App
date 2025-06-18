// src/components/MessageInput.jsx
import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useResponsive } from "../hooks/useResponsive";
import { useVirtualKeyboard } from "../hooks/useKeyboard";
import { Paperclip, Send, X, Smile, Mic } from "lucide-react";
import toast from "react-hot-toast";
import FileUpload from "./FileUpload";
import VoiceRecorder from "./VoiceRecorder"; // 🆕 Import VoiceRecorder
import { isAudioRecordingSupported } from "../utils/audioUtils"; // 🆕 Import audio utils

const MessageInput = ({ isMobile = false }) => {
  const [text, setText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false); // 🆕 Voice recorder state
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const textAreaRef = useRef(null);
  
  const { isSmallMobile } = useResponsive();
  const { isKeyboardOpen } = useVirtualKeyboard();
  
  const { 
    sendMessage,
    sendVoiceNote, // 🆕 Voice note function from store
    handleTyping,
    stopTyping,
    selectedUser,
    selectedGroup,
    chatType
  } = useChatStore();

  // 🆕 Check if audio recording is supported
  const audioSupported = isAudioRecordingSupported();

  // 🆕 Handle voice note sending
  const handleSendVoiceNote = async ({ audioBlob, duration, waveform }) => {
    if (!selectedUser && !selectedGroup) {
      toast.error("Please select a chat first");
      return;
    }

    try {
      setIsUploading(true);
      
      await sendVoiceNote({
        audioBlob,
        duration,
        waveform,
        receiverId: selectedUser?._id,
        groupId: selectedGroup?._id,
        chatType
      });
      
      setShowVoiceRecorder(false);
      toast.success('Voice note sent!');
      
    } catch (error) {
      console.error("Error sending voice note:", error);
      toast.error("Failed to send voice note");
    } finally {
      setIsUploading(false);
    }
  };

  // 🆕 Handle voice recorder cancel
  const handleVoiceRecorderCancel = () => {
    setShowVoiceRecorder(false);
  };

  const handleFileSelect = (file, fileType) => {
    setSelectedFile(file);
    
    if (fileType.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
    
    setShowFileUpload(false);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setShowFileUpload(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    
    if (newText.trim()) {
      handleTyping(newText);
    } else {
      stopTyping();
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !selectedFile) return;

    stopTyping();
    
    setIsUploading(true);
    try {
      await sendMessage({
        text: text.trim(),
        file: selectedFile,
      });

      setText("");
      setSelectedFile(null);
      setFilePreview(null);
      setShowFileUpload(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      
      if (textAreaRef.current) {
        textAreaRef.current.style.height = 'auto';
      }
      
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsUploading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleBlur = () => {
    stopTyping();
  };

  // 🆕 Show voice recorder instead of input when recording
  if (showVoiceRecorder) {
    return (
      <div className={`bg-base-100 ${
        isMobile ? 'p-3' : 'p-4'
      } ${isKeyboardOpen ? 'pb-safe-bottom' : ''}`}>
        <VoiceRecorder
          onSendVoiceNote={handleSendVoiceNote}
          onCancel={handleVoiceRecorderCancel}
          className="w-full"
        />
      </div>
    );
  }

  return (
    <div className={`bg-base-100 ${
      isMobile ? 'p-3' : 'p-4'
    } ${isKeyboardOpen ? 'pb-safe-bottom' : ''}`}>
      
      {/* File Upload Modal */}
      {showFileUpload && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className={`font-medium text-base-content ${
              isMobile ? 'text-sm' : 'text-sm'
            }`}>
              Upload File
            </h3>
            <button
              onClick={() => setShowFileUpload(false)}
              className={`btn btn-circle btn-ghost ${
                isMobile ? 'btn-xs' : 'btn-sm'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <FileUpload
            onFileSelect={handleFileSelect}
            onRemove={removeFile}
            selectedFile={selectedFile}
            filePreview={filePreview}
            isMobile={isMobile}
          />
        </div>
      )}

      {/* Selected File Preview */}
      {selectedFile && !showFileUpload && (
        <div className="mb-3">
          <FileUpload
            onFileSelect={handleFileSelect}
            onRemove={removeFile}
            selectedFile={selectedFile}
            filePreview={filePreview}
            isMobile={isMobile}
          />
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className={`flex items-end ${
        isMobile ? 'gap-2' : 'gap-3'
      }`}>
        
        {/* Main Input Container */}
        <div className="flex-1 relative">
          <div className={`flex items-end bg-base-200 rounded-2xl border border-base-300 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all ${
            isMobile ? 'rounded-xl' : 'rounded-2xl'
          }`}>
            
            {/* Text Input */}
            <textarea
              ref={textAreaRef}
              value={text}
              onChange={handleTextChange}
              onKeyPress={handleKeyPress}
              onBlur={handleBlur}
              placeholder="Type a message..."
              className={`flex-1 bg-transparent border-0 outline-none resize-none text-base-content placeholder-base-content/50 max-h-32 leading-relaxed input-mobile ${
                isMobile 
                  ? 'px-3 py-2.5 text-sm min-h-[40px]' 
                  : 'px-4 py-3 text-sm min-h-[44px]'
              }`}
              rows="1"
              disabled={isUploading}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
              }}
            />

            {/* Action Buttons Container */}
            <div className={`flex items-center ${
              isMobile ? 'gap-0.5 pr-1 pb-1' : 'gap-1 pr-2 pb-2'
            }`}>
              
              {/* File Attachment Button */}
              <button
                type="button"
                className={`btn btn-ghost btn-circle touch-manipulation ${
                  isMobile ? 'btn-sm' : 'btn-sm'
                }`}
                onClick={() => setShowFileUpload(!showFileUpload)}
                title="Attach file"
                disabled={isUploading}
              >
                <Paperclip className={isMobile ? 'w-4 h-4' : 'w-5 h-5'} />
              </button>

              {/* 🆕 Voice Note Button - Show when no text or on desktop */}
              {audioSupported && (!text.trim() || !isMobile) && (
                <button
                  type="button"
                  className={`btn btn-ghost btn-circle touch-manipulation ${
                    isMobile ? 'btn-sm' : 'btn-sm'
                  }`}
                  onClick={() => setShowVoiceRecorder(true)}
                  title="Record voice note"
                  disabled={isUploading}
                >
                  <Mic className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} ${
                    !text.trim() ? 'text-primary' : 'text-base-content'
                  }`} />
                </button>
              )}

              {/* Emoji Button - Show when text exists or not small mobile */}
              {(text.trim() || !isSmallMobile) && !(!text.trim() && audioSupported && isMobile) && (
                <button
                  type="button"
                  className={`btn btn-ghost btn-circle touch-manipulation ${
                    isMobile ? 'btn-sm' : 'btn-sm'
                  }`}
                  title="Add emoji"
                  disabled={isUploading}
                >
                  <Smile className={isMobile ? 'w-4 h-4' : 'w-5 h-5'} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={(!text.trim() && !selectedFile) || isUploading}
          className={`btn btn-circle touch-manipulation btn-touch ${
            isMobile ? 'btn-sm' : ''
          } ${
            text.trim() || selectedFile
              ? 'btn-primary shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95'
              : 'btn-disabled'
          }`}
        >
          {isUploading ? (
            <div className={`animate-spin rounded-full border-b-2 border-white ${
              isMobile ? 'h-4 w-4' : 'h-5 w-5'
            }`}></div>
          ) : (
            <Send className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} ${
              text.trim() || selectedFile ? 'translate-x-0.5' : ''
            }`} />
          )}
        </button>
      </form>

      {/* Status/Tips */}
      <div className="mt-2 text-center">
        {isUploading ? (
          <p className={`text-primary ${isMobile ? 'text-xs' : 'text-xs'}`}>
            Uploading...
          </p>
        ) : (
          <p className={`text-base-content/50 ${
            isMobile ? 'text-xs' : 'text-xs'
          }`}>
            {isMobile 
              ? `Tap to send • Support: Images, Docs, Videos${audioSupported ? ', Voice' : ''}`
              : `Press Enter to send • Shift + Enter for new line • Support: Images, Documents, Videos, Audio${audioSupported ? ', Voice Notes' : ''}`
            }
          </p>
        )}
      </div>
    </div>
  );
};

export default MessageInput;