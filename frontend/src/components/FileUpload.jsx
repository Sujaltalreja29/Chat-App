import { useState, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { 
  Upload, 
  X, 
  File, 
  Image as ImageIcon, 
  Video, 
  Music, 
  FileText,
  AlertCircle 
} from "lucide-react";
import toast from "react-hot-toast";
import { compressImage } from "../utils/imageCompression";

const FileUpload = ({ onFileSelect, onRemove, selectedFile, filePreview }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // File type validation
  const validateFile = (file) => {
    const maxSize = 25 * 1024 * 1024; // 25MB
    const allowedTypes = [
      // Images
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      // Documents
      'application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      // Videos
      'video/mp4', 'video/quicktime', 'video/x-msvideo',
      // Audio
      'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'
    ];

    if (file.size > maxSize) {
      toast.error(`File size should be less than 25MB. Current size: ${formatFileSize(file.size)}`);
      return false;
    }

    if (!allowedTypes.includes(file.type)) {
      toast.error(`File type "${file.type}" is not supported`);
      return false;
    }

    return true;
  };

  // Handle file selection
  const handleFileSelect = async (files) => {
    const file = files[0];
    if (!file || !validateFile(file)) return;

    setIsProcessing(true);
    try {
      let processedFile = file;
      
      // Compress images on client-side before upload
      if (file.type.startsWith('image/')) {
        console.log('🗜️ Compressing image...');
        processedFile = await compressImage(file);
        const compressionRatio = ((file.size - processedFile.size) / file.size * 100).toFixed(1);
        console.log(`✅ Image compressed by ${compressionRatio}%`);
      }

      onFileSelect(processedFile, file.type);
      toast.success(`File selected: ${file.name}`);
    } catch (error) {
      console.error('File processing error:', error);
      toast.error('Failed to process file');
    } finally {
      setIsProcessing(false);
    }
  };

  // 🔥 FIX: Proper dropzone configuration
  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop: handleFileSelect,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    multiple: false,
    disabled: !!selectedFile || isProcessing,
    noClick: true, // We'll handle click manually
    noKeyboard: true
  });

  // 🔥 FIX: Manual click handler
  const handleClick = () => {
    if (!selectedFile && !isProcessing) {
      open(); // This opens the file dialog
    }
  };

  // Get file icon based on type
  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return <ImageIcon className="w-8 h-8" />;
    if (fileType.startsWith('video/')) return <Video className="w-8 h-8" />;
    if (fileType.startsWith('audio/')) return <Music className="w-8 h-8" />;
    if (fileType.includes('pdf') || fileType.includes('document')) return <FileText className="w-8 h-8" />;
    return <File className="w-8 h-8" />;
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (selectedFile) {
    return (
      <div className="mb-4 p-4 bg-base-200 rounded-lg border border-base-300">
        <div className="flex items-start gap-3">
          {/* File Preview */}
          <div className="flex-shrink-0">
            {selectedFile.type.startsWith('image/') && filePreview ? (
              <img
                src={filePreview}
                alt="Preview"
                className="w-16 h-16 object-cover rounded-lg border border-base-300"
              />
            ) : (
              <div className="w-16 h-16 bg-base-300 rounded-lg flex items-center justify-center text-base-content/60">
                {getFileIcon(selectedFile.type)}
              </div>
            )}
          </div>

          {/* File Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-base-content truncate">
              {selectedFile.name}
            </p>
            <p className="text-xs text-base-content/60">
              {formatFileSize(selectedFile.size)} • {selectedFile.type.split('/')[1].toUpperCase()}
            </p>
            <p className="text-xs text-success mt-1">
              Ready to send
            </p>
          </div>

          {/* Remove Button */}
          <button
            onClick={onRemove}
            className="btn btn-sm btn-circle btn-ghost text-error hover:bg-error hover:text-error-content"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hidden file input */}
      <input {...getInputProps()} />
      
      {/* Drop zone */}
      <div
        {...getRootProps()}
        onClick={handleClick} // 🔥 FIX: Add click handler
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200
          ${isDragActive 
            ? 'border-primary bg-primary/10 scale-105' 
            : 'border-base-300 hover:border-primary/50 hover:bg-base-200/50'
          }
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <div className="space-y-3">
          {/* Icon */}
          {isProcessing ? (
            <div className="w-8 h-8 mx-auto">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Upload 
              className={`w-8 h-8 mx-auto transition-colors ${isDragActive ? 'text-primary' : 'text-base-content/60'}`} 
            />
          )}
          
          {/* Text */}
          <div>
            <p className={`text-sm font-medium transition-colors ${isDragActive ? 'text-primary' : 'text-base-content'}`}>
              {isProcessing ? 'Processing file...' : isDragActive ? 'Drop file here' : 'Drop files or click to upload'}
            </p>
            <p className="text-xs text-base-content/60 mt-1">
              Images, Documents, Videos, Audio (Max 25MB)
            </p>
          </div>

          {/* Supported formats */}
          <div className="flex flex-wrap gap-2 justify-center text-xs text-base-content/60">
            <span className="bg-base-300 px-2 py-1 rounded">JPG, PNG, GIF</span>
            <span className="bg-base-300 px-2 py-1 rounded">PDF, DOC, TXT</span>
            <span className="bg-base-300 px-2 py-1 rounded">MP4, MOV</span>
            <span className="bg-base-300 px-2 py-1 rounded">MP3, WAV</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;