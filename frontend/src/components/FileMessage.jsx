import { 
  Download, 
  File, 
  Image as ImageIcon, 
  Video, 
  Music, 
  FileText,
  Eye,
  ExternalLink
} from "lucide-react";

const FileMessage = ({ file, isOwn }) => {
  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file icon
  const getFileIcon = (fileType) => {
    const iconClass = "w-6 h-6";
    if (fileType === 'image') return <ImageIcon className={iconClass} />;
    if (fileType === 'video') return <Video className={iconClass} />;
    if (fileType === 'audio') return <Music className={iconClass} />;
    if (fileType === 'document') return <FileText className={iconClass} />;
    return <File className={iconClass} />;
  };

  // Get file type color
  const getFileTypeColor = (fileType) => {
    switch (fileType) {
      case 'image': return 'text-green-600';
      case 'video': return 'text-purple-600';
      case 'audio': return 'text-blue-600';
      case 'document': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  // Handle download
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.originalName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle preview
  const handlePreview = () => {
    window.open(file.url, '_blank');
  };

  // Render image file
  if (file.fileType === 'image') {
    return (
      <div className="relative group">
        <img
          src={file.thumbnail || file.url}
          alt={file.originalName}
          className="max-w-[300px] w-full rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
          onClick={handlePreview}
        />
        
        {/* Image overlay with actions */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
          <button
            onClick={handlePreview}
            className="btn btn-sm btn-circle bg-white/20 border-white/30 text-white hover:bg-white/30"
            title="View full size"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={handleDownload}
            className="btn btn-sm btn-circle bg-white/20 border-white/30 text-white hover:bg-white/30"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

        {/* Compression info */}
        {file.isCompressed && (
          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            -{file.compressionRatio}%
          </div>
        )}
      </div>
    );
  }

  // Render video file
  if (file.fileType === 'video') {
    return (
      <div className="max-w-[400px]">
        <video
          controls
          className="w-full rounded-lg"
          preload="metadata"
        >
          <source src={file.url} type={file.mimeType} />
          Your browser does not support the video tag.
        </video>
        
        <div className="mt-2 flex items-center justify-between text-xs text-base-content/60">
          <span className="truncate">{file.originalName}</span>
          <button
            onClick={handleDownload}
            className="btn btn-xs btn-ghost"
            title="Download"
          >
            <Download className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  // Render audio file
  if (file.fileType === 'audio') {
    return (
      <div className="max-w-[350px]">
        <audio
          controls
          className="w-full"
          preload="metadata"
        >
          <source src={file.url} type={file.mimeType} />
          Your browser does not support the audio element.
        </audio>
        
        <div className="mt-2 flex items-center justify-between text-xs text-base-content/60">
          <span className="truncate">{file.originalName}</span>
          <button
            onClick={handleDownload}
            className="btn btn-xs btn-ghost"
            title="Download"
          >
            <Download className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  // Render other file types (documents, etc.)
  return (
    <div className={`
      flex items-center gap-3 p-3 rounded-lg border max-w-[350px]
      ${isOwn 
        ? 'bg-primary/10 border-primary/20' 
        : 'bg-base-300 border-base-content/20'
      }
    `}>
      {/* File Icon */}
      <div className={`flex-shrink-0 ${getFileTypeColor(file.fileType)}`}>
        {getFileIcon(file.fileType)}
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-base-content truncate">
          {file.originalName}
        </p>
        <p className="text-xs text-base-content/60">
          {formatFileSize(file.fileSize)} • {file.mimeType.split('/')[1].toUpperCase()}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-1">
        <button
          onClick={handlePreview}
          className="btn btn-xs btn-ghost"
          title="Open"
        >
          <ExternalLink className="w-3 h-3" />
        </button>
        <button
          onClick={handleDownload}
          className="btn btn-xs btn-ghost"
          title="Download"
        >
          <Download className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default FileMessage;