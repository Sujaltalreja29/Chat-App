import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Paperclip, Send, X, Smile } from "lucide-react";
import toast from "react-hot-toast";
import FileUpload from "./FileUpload";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const textAreaRef = useRef(null);
  
  const { 
    sendMessage, 
    handleTyping, // 🔥 NEW
    stopTyping   // 🔥 NEW
  } = useChatStore();

  // Handle file selection from FileUpload component
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

  // Remove selected file
  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setShowFileUpload(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // 🔥 NEW: Handle text change with typing detection
  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    
    // Trigger typing indicator
    if (newText.trim()) {
      handleTyping(newText);
    } else {
      stopTyping();
    }
  };

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !selectedFile) return;

    // Stop typing when sending message
    stopTyping();
    
    setIsUploading(true);
    try {
      await sendMessage({
        text: text.trim(),
        file: selectedFile,
      });

      // Reset UI
      setText("");
      setSelectedFile(null);
      setFilePreview(null);
      setShowFileUpload(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      
      // Reset textarea height
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

  // 🔥 NEW: Handle key press with typing detection
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // 🔥 NEW: Handle blur to stop typing
  const handleBlur = () => {
    stopTyping();
  };

  return (
    <div className="bg-base-100 p-4">
      {/* File Upload Modal */}
      {showFileUpload && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-base-content">Upload File</h3>
            <button
              onClick={() => setShowFileUpload(false)}
              className="btn btn-sm btn-circle btn-ghost"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <FileUpload
            onFileSelect={handleFileSelect}
            onRemove={removeFile}
            selectedFile={selectedFile}
            filePreview={filePreview}
          />
        </div>
      )}

      {/* Selected File Preview */}
      {selectedFile && !showFileUpload && (
        <FileUpload
          onFileSelect={handleFileSelect}
          onRemove={removeFile}
          selectedFile={selectedFile}
          filePreview={filePreview}
        />
      )}

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="flex items-end gap-3">
        
        {/* Main Input Container */}
        <div className="flex-1 relative">
          <div className="flex items-end bg-base-200 rounded-2xl border border-base-300 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
            
            {/* Text Input */}
            <textarea
              ref={textAreaRef}
              value={text}
              onChange={handleTextChange}
              onKeyPress={handleKeyPress}
              onBlur={handleBlur} // 🔥 NEW: Stop typing on blur
              placeholder="Type a message..."
              className="flex-1 bg-transparent border-0 outline-none resize-none px-4 py-3 text-base-content placeholder-base-content/50 max-h-32 min-h-[44px] text-sm leading-relaxed"
                           rows="1"
              disabled={isUploading}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
              }}
            />

            {/* Action Buttons Container */}
            <div className="flex items-center gap-1 pr-2 pb-2">
              
              {/* File Attachment Button */}
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-circle"
                onClick={() => setShowFileUpload(!showFileUpload)}
                title="Attach file"
                disabled={isUploading}
              >
                <Paperclip className="w-5 h-5" />
              </button>

              {/* Emoji Button */}
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-circle"
                title="Add emoji"
                disabled={isUploading}
              >
                <Smile className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={(!text.trim() && !selectedFile) || isUploading}
          className={`btn btn-circle ${
            text.trim() || selectedFile
              ? 'btn-primary shadow-lg hover:shadow-xl transform hover:scale-105'
              : 'btn-disabled'
          }`}
        >
          {isUploading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <Send className={`w-5 h-5 ${text.trim() || selectedFile ? 'translate-x-0.5' : ''}`} />
          )}
        </button>
      </form>

      {/* Status/Tips */}
      <div className="mt-2 text-center">
        {isUploading ? (
          <p className="text-xs text-primary">Uploading...</p>
        ) : (
          <p className="text-xs text-base-content/50">
            Press Enter to send • Shift + Enter for new line • Support: Images, Documents, Videos, Audio
          </p>
        )}
      </div>
    </div>
  );
};

export default MessageInput;