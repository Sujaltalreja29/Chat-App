import { useState, useEffect } from 'react';
import { Mic, Square, Send, X, Play, Pause, RotateCcw } from 'lucide-react';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import AudioWaveform from './AudioWaveform';
import { formatAudioTime } from '../constants/audioConfig';
import toast from 'react-hot-toast';

const VoiceRecorder = ({ onSendVoiceNote, onCancel, className = "" }) => {
  const {
    isRecording,
    isPaused,
    recordingTime,
    audioBlob,
    waveformData,
    isProcessing,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    cancelRecording,
    canRecord,
    canPause,
    canResume,
    hasRecording,
    recordingTimeFormatted
  } = useVoiceRecorder();
  const [isSending, setIsSending] = useState(false);

  // Audio player for playback preview
  const [previewUrl, setPreviewUrl] = useState(null);
  const {
    isPlaying,
    togglePlay,
    currentTimeFormatted,
    durationFormatted,
    progress
  } = useAudioPlayer(previewUrl);
  
  // Create preview URL when audio blob is ready
  useEffect(() => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      setPreviewUrl(url);
      
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPreviewUrl(null);
    }
  }, [audioBlob]);

  
  
  // Handle send voice note
  const handleSend = async () => {
    if (!audioBlob) {
      toast.error('No recording to send');
      return;
    }
    
    try {
      setIsSending(true); // 🔧 Show loading
      await onSendVoiceNote({
        audioBlob,
        duration: recordingTime,
        waveform: waveformData
      });
      
      // 🔧 Don't call handleCancel immediately - let the socket message confirm success
      toast.success('Voice note sent!');
      
      // 🔧 Reset after a short delay to allow socket message to arrive
      setTimeout(() => {
        handleCancel();
      }, 500);
      
    } catch (error) {
      console.error('Error sending voice note:', error);
      toast.error('Failed to send voice note');
      setIsSending(false); // 🔧 Reset loading on error
    }
  };

  // Handle cancel
  const handleCancel = () => {
    cancelRecording();
    onCancel?.();
  };
  
  // Handle start recording with permission check
  const handleStartRecording = async () => {
    try {
      await startRecording();
    } catch (error) {
      toast.error('Please allow microphone access to record voice notes');
    }
  };
  
  // Recording state UI
  if (isRecording || hasRecording) {
    return (
      <div className={`flex items-center gap-3 p-4 bg-base-200 rounded-lg animate-in slide-in-from-bottom-2 ${className}`}>
        
        {/* Recording Controls */}
        {isRecording && (
          <>
            <button
              onClick={stopRecording}
              className="btn btn-circle btn-error btn-sm"
              disabled={isProcessing}
            >
              <Square size={16} />
            </button>
            
            <div className="flex-1 min-w-0">
              <AudioWaveform
                data={waveformData}
                isRecording={true}
                height={32}
                className="mb-1"
                color="rgba(156, 163, 175, 0.6)"
                activeColor="#ef4444"
              />
              <div className="flex justify-between items-center text-xs text-base-content/70">
                <span>Recording...</span>
                <span className="font-mono">{recordingTimeFormatted}</span>
              </div>
            </div>
          </>
        )}
        
        {/* Playback Controls */}
        {hasRecording && !isRecording && (
          <>
            <button
              onClick={togglePlay}
              className="btn btn-circle btn-primary btn-sm"
              disabled={isProcessing}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            
            <div className="flex-1 min-w-0">
              <AudioWaveform
                data={waveformData}
                isRecording={false}
                progress={progress}
                height={32}
                className="mb-1"
                color="rgba(156, 163, 175, 0.6)"
                activeColor="#3b82f6"
              />
              <div className="flex justify-between items-center text-xs text-base-content/70">
                <span>{isPlaying ? currentTimeFormatted : durationFormatted}</span>
                <span className="font-mono">{recordingTimeFormatted}</span>
              </div>
            </div>
            
            {/* Re-record button */}
            <button
              onClick={handleStartRecording}
              className="btn btn-circle btn-ghost btn-sm"
              title="Record again"
            >
              <RotateCcw size={16} />
            </button>
          </>
        )}
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleCancel}
            className="btn btn-circle btn-ghost btn-sm"
            title="Cancel"
          >
            <X size={16} />
          </button>
          
  {hasRecording && (
    <button
      onClick={handleSend}
      className="btn btn-circle btn-success btn-sm"
      disabled={isProcessing || isSending} // 🔧 Disable when sending
      title="Send voice note"
    >
      {isSending ? ( // 🔧 Show loading spinner
        <div className="loading loading-spinner loading-xs" />
      ) : (
        <Send size={16} />
      )}
    </button>
  )}
        </div>
      </div>
    );
  }
  
  // Initial record button
  return (
    <button
      onClick={handleStartRecording}
      className={`btn btn-circle btn-primary ${className}`}
      disabled={isProcessing}
      title="Record voice note"
    >
      <Mic size={20} />
    </button>
  );
};

export default VoiceRecorder;