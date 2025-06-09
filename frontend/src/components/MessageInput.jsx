import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X, Smile } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const { sendMessage } = useChatStore();

const handleImageChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    toast.error("Please select an image file");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    toast.error("Image size should be less than 5MB");
    return;
  }

  // Save File object → this will be sent to backend
  setImageFile(file);

  // For preview only → base64
  const reader = new FileReader();
  reader.onloadend = () => {
    setImagePreview(reader.result);
  };
  reader.readAsDataURL(file);
};


  const removeImage = () => {
  setImagePreview(null);
  setImageFile(null); // also reset the file
  if (fileInputRef.current) fileInputRef.current.value = "";
};


  const handleSendMessage = async (e) => {
  e.preventDefault();
  if (!text.trim() && !imagePreview) return;

  try {
    await sendMessage({
      text: text.trim(),
      imageFile, // send File object here
    });

    // Reset UI
    setText("");
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  } catch (error) {
    console.error("Failed to send message:", error);
    toast.error("Failed to send message");
  }
};


  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div className="bg-base-100 p-4">
      {/* Image Preview */}
      {imagePreview && (
        <div className="mb-4 p-3 bg-base-200 rounded-lg border border-base-300">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-16 h-16 object-cover rounded-lg border border-base-300"
              />
              <button
                onClick={removeImage}
                className="absolute -top-2 -right-2 w-6 h-6 bg-error hover:bg-error-focus text-error-content rounded-full flex items-center justify-center transition-colors shadow-sm"
                type="button"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-base-content">Image ready to send</p>
              <p className="text-xs text-base-content/60">Click the remove button to cancel</p>
            </div>
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="flex items-end gap-3">
        
        {/* Main Input Container */}
        <div className="flex-1 relative">
          <div className="flex items-end bg-base-200 rounded-2xl border border-base-300 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
            
            {/* Text Input */}
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 bg-transparent border-0 outline-none resize-none px-4 py-3 text-base-content placeholder-base-content/50 max-h-32 min-h-[44px] text-sm leading-relaxed"
              rows="1"
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
              }}
            />

            {/* Action Buttons Container */}
            <div className="flex items-center gap-1 pr-2 pb-2">
              
                            {/* Attachment Button */}
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-circle"
                onClick={() => fileInputRef.current?.click()}
                title="Attach image"
              >
                <Image className="w-5 h-5" />
              </button>

              {/* Emoji Button */}
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-circle"
                title="Add emoji"
              >
                <Smile className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!text.trim() && !imagePreview}
          className={`btn btn-circle ${
            text.trim() || imagePreview
              ? 'btn-primary shadow-lg hover:shadow-xl transform hover:scale-105'
              : 'btn-disabled'
          }`}
        >
          <Send className={`w-5 h-5 ${text.trim() || imagePreview ? 'translate-x-0.5' : ''}`} />
        </button>
      </form>

      {/* Quick Tip */}
      <div className="mt-2 text-center">
        <p className="text-xs text-base-content/50">
          Press Enter to send • Shift + Enter for new line
        </p>
      </div>
    </div>
  );
};

export default MessageInput;