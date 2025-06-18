import { useState, useRef, useCallback, useEffect } from 'react';
import { AUDIO_CONFIG, getBestAudioFormat } from '../constants/audioConfig.js';
import { 
  createWaveformAnalyzer, 
  getAudioDuration,
  getOptimalRecordingOptions,
  getAudioConstraints
} from '../utils/audioUtils.js';
import toast from 'react-hot-toast';

export const useVoiceRecorder = () => {
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [waveformData, setWaveformData] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Refs
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const waveformAnalyzerRef = useRef(null);
  const timerRef = useRef(null);
  const chunksRef = useRef([]);
  const typingTimeoutRef = useRef(null);
  
  // Start recording timer
  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => {
        const newTime = prev + 1;
        
        // Auto-stop at max duration
        if (newTime >= AUDIO_CONFIG.MAX_DURATION) {
          stopRecording();
        }
        
        return newTime;
      });
    }, 1000);
  }, []);
  
  // Stop recording timer
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);
  
  // Update waveform during recording
  const updateWaveform = useCallback((amplitude) => {
    setWaveformData(prev => {
      const newData = [...prev, amplitude];
      // Keep more samples for better visualization
      const maxSamples = AUDIO_CONFIG.WAVEFORM_SAMPLES;
      if (newData.length > maxSamples) {
        // Remove oldest samples but keep the recent trend
        return newData.slice(-maxSamples);
      }
      return newData;
    });
  }, []);
  
  // Cleanup resources
  const cleanup = useCallback(() => {
    // Stop timer
    stopTimer();
    
    // Clear typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    
    // Stop media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Cleanup waveform analyzer
    if (waveformAnalyzerRef.current) {
      if (waveformAnalyzerRef.current.updateInterval) {
        clearInterval(waveformAnalyzerRef.current.updateInterval);
      }
      if (waveformAnalyzerRef.current.cleanup) {
        waveformAnalyzerRef.current.cleanup();
      }
      waveformAnalyzerRef.current = null;
    }
    
    // Clear media recorder
    mediaRecorderRef.current = null;
  }, [stopTimer]);
  
  // Start recording
  const startRecording = useCallback(async () => {
    try {
      setIsProcessing(true);
      
      // Reset state
      setAudioBlob(null);
      setWaveformData([]);
      setRecordingTime(0);
      chunksRef.current = [];
      
      // Get user media with optimized constraints
      const constraints = getAudioConstraints();
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      streamRef.current = stream;
      
      // Create waveform analyzer
      const analyzer = createWaveformAnalyzer(stream, updateWaveform);
      waveformAnalyzerRef.current = analyzer;
      
      // Create media recorder with optimal settings
      const recordingOptions = getOptimalRecordingOptions();
      const mediaRecorder = new MediaRecorder(stream, recordingOptions);
      
      mediaRecorderRef.current = mediaRecorder;
      
      // Handle data available
      mediaRecorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      });
      
      // Handle recording stop
      mediaRecorder.addEventListener('stop', async () => {
        try {
          const mimeType = recordingOptions.mimeType || 'audio/webm';
          const audioBlob = new Blob(chunksRef.current, { type: mimeType });
          
          // Validate minimum duration
          const duration = await getAudioDuration(audioBlob);
          if (duration < AUDIO_CONFIG.MIN_DURATION && recordingTime < AUDIO_CONFIG.MIN_DURATION) {
            toast.error('Recording too short. Minimum 1 second required.');
            cleanup();
            return;
          }
          
          setAudioBlob(audioBlob);
          
          // Clean up streams but keep the audioBlob
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
          }
          
          // Clean up analyzer
          if (waveformAnalyzerRef.current) {
            if (waveformAnalyzerRef.current.updateInterval) {
              clearInterval(waveformAnalyzerRef.current.updateInterval);
            }
            if (waveformAnalyzerRef.current.cleanup) {
              waveformAnalyzerRef.current.cleanup();
            }
            waveformAnalyzerRef.current = null;
          }
          
        } catch (error) {
          console.error('Error processing recorded audio:', error);
          toast.error('Failed to process recording');
          cleanup();
        }
      });
      
      // Handle recording errors
      mediaRecorder.addEventListener('error', (event) => {
        console.error('MediaRecorder error:', event.error);
        toast.error('Recording error occurred');
        cleanup();
      });
      
      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      startTimer();
      
      // Start waveform updates
      if (analyzer) {
        const updateInterval = setInterval(() => {
          if (analyzer.updateWaveform) {
            analyzer.updateWaveform();
          }
        }, AUDIO_CONFIG.UPDATE_INTERVAL);
        
        // Store interval for cleanup
        analyzer.updateInterval = updateInterval;
      }
      
      toast.success('Recording started');
      
    } catch (error) {
      console.error('Error starting recording:', error);
      
      if (error.name === 'NotAllowedError') {
        toast.error('Microphone access denied. Please allow microphone permissions.');
      } else if (error.name === 'NotFoundError') {
        toast.error('No microphone found. Please check your audio devices.');
      } else if (error.name === 'NotSupportedError') {
        toast.error('Audio recording not supported in this browser.');
      } else {
        toast.error('Failed to start recording. Please try again.');
      }
      
      cleanup();
    } finally {
      setIsProcessing(false);
    }
  }, [startTimer, updateWaveform, cleanup]);
  
  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        stopTimer();
        toast.success('Recording stopped');
      } catch (error) {
        console.error('Error stopping recording:', error);
        toast.error('Failed to stop recording');
      }
    }
  }, [isRecording, stopTimer]);
  
  // Pause recording (if supported)
  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && !isPaused && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
        stopTimer();
        toast.success('Recording paused');
      } catch (error) {
        console.error('Error pausing recording:', error);
        // Pause not supported, continue recording
        toast.error('Pause not supported in this browser');
      }
    }
  }, [isRecording, isPaused, stopTimer]);
  
  // Resume recording (if supported)
  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && isPaused && mediaRecorderRef.current.state === 'paused') {
      try {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
        startTimer();
        toast.success('Recording resumed');
      } catch (error) {
        console.error('Error resuming recording:', error);
        toast.error('Failed to resume recording');
      }
    }
  }, [isRecording, isPaused, startTimer]);
  
  // Cancel recording
  const cancelRecording = useCallback(() => {
    try {
      if (isRecording && mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      
      setIsRecording(false);
      setIsPaused(false);
      setRecordingTime(0);
      setAudioBlob(null);
      setWaveformData([]);
      chunksRef.current = [];
      
      cleanup();
      toast.success('Recording cancelled');
    } catch (error) {
      console.error('Error cancelling recording:', error);
      // Still cleanup and reset state
      setIsRecording(false);
      setIsPaused(false);
      setRecordingTime(0);
      setAudioBlob(null);
      setWaveformData([]);
      chunksRef.current = [];
      cleanup();
    }
  }, [isRecording, cleanup]);
  
  // Reset recording (for re-recording)
  const resetRecording = useCallback(() => {
    setAudioBlob(null);
    setWaveformData([]);
    setRecordingTime(0);
    chunksRef.current = [];
    setIsRecording(false);
    setIsPaused(false);
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);
  
  return {
    // State
    isRecording,
    isPaused,
    recordingTime,
    audioBlob,
    waveformData,
    isProcessing,
    
    // Actions
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    cancelRecording,
    resetRecording,
    
    // Computed values
    canRecord: !isRecording && !audioBlob && !isProcessing,
    canPause: isRecording && !isPaused && !isProcessing,
    canResume: isRecording && isPaused && !isProcessing,
    hasRecording: !!audioBlob,
    recordingTimeFormatted: `${Math.floor(recordingTime / 60)}:${(recordingTime % 60).toString().padStart(2, '0')}`,
    
    // Recording status
    isActive: isRecording || !!audioBlob,
    canSend: !!audioBlob && !isProcessing,
    
    // Recording info
    maxDuration: AUDIO_CONFIG.MAX_DURATION,
    remainingTime: AUDIO_CONFIG.MAX_DURATION - recordingTime,
    progressPercentage: (recordingTime / AUDIO_CONFIG.MAX_DURATION) * 100
  };
};