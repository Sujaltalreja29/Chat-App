import { useState, useEffect } from 'react';
import { Play, Pause, Download, Volume2 } from 'lucide-react';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import AudioWaveform from './AudioWaveform';
import { formatAudioTime } from '../constants/audioConfig';

const VoiceMessage = ({ 
  message, 
  isOwnMessage = false, 
  className = "" 
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  
  const {
    isPlaying,
    currentTime,
    duration,
    isLoading,
    togglePlay,
    currentTimeFormatted,
    durationFormatted,
    progress
  } = useAudioPlayer(message?.file?.url);
  
  // Handle download
  const handleDownload = async () => {
    if (!message?.file?.url) return;
    
    try {
      setIsDownloading(true);
      const response = await fetch(message.file.url);
      const blob = await response.blob();
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `voice-note-${Date.now()}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };
  
  // Get display duration (from metadata or calculated)
  const displayDuration = message?.file?.duration || duration || 0;
  const displayDurationFormatted = formatAudioTime(displayDuration);
  
  return (
    <div className={`
      flex items-center gap-3 p-3 rounded-lg max-w-sm
      ${isOwnMessage 
        ? 'bg-primary text-primary-content ml-auto' 
        : 'bg-base-200 text-base-content'
      }
      ${className}
    `}>
      
      {/* Play/Pause Button */}
      <button
        onClick={togglePlay}
        className={`
          btn btn-circle btn-sm
          ${isOwnMessage 
            ? 'btn-primary-content bg-primary-content/20 hover:bg-primary-content/30' 
            : 'btn-primary'
          }
        `}
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="loading loading-spinner loading-xs" />
        ) : isPlaying ? (
          <Pause size={14} />
        ) : (
          <Play size={14} />
        )}
      </button>
      
      {/* Waveform and Duration */}
      <div className="flex-1 min-w-0">
        <AudioWaveform
          data={message?.file?.waveform || []}
          isRecording={false}
          progress={progress}
          height={24}
          className="mb-1"
          color={isOwnMessage ? 'rgba(255, 255, 255, 0.6)' : 'rgba(156, 163, 175, 0.6)'}
          activeColor={isOwnMessage ? '#ffffff' : '#3b82f6'}
        />
        
        <div className="flex justify-between items-center text-xs opacity-70">
          <span>
            {isPlaying ? currentTimeFormatted : '0:00'}
          </span>
          <span className="font-mono">
            {displayDurationFormatted}
          </span>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-1">
        {/* Volume indicator */}
        <div className={`
          p-1 rounded
          ${isOwnMessage ? 'text-primary-content/70' : 'text-base-content/70'}
        `}>
          <Volume2 size={12} />
        </div>
        
        {/* Download button */}
        <button
          onClick={handleDownload}
          className={`
            btn btn-ghost btn-xs
            ${isOwnMessage 
              ? 'text-primary-content/70 hover:text-primary-content' 
              : 'text-base-content/70 hover:text-base-content'
            }
          `}
          disabled={isDownloading}
          title="Download voice note"
        >
          {isDownloading ? (
            <div className="loading loading-spinner loading-xs" />
          ) : (
            <Download size={12} />
          )}
        </button>
      </div>
    </div>
  );
};

export default VoiceMessage;