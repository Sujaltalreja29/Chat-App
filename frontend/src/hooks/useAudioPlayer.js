import { useState, useRef, useCallback, useEffect } from 'react';
import { formatAudioTime } from '../constants/audioConfig.js';

export const useAudioPlayer = (audioUrl) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  
  const audioRef = useRef(null);
  const progressIntervalRef = useRef(null);
  
  // Initialize audio element
  useEffect(() => {
    if (!audioUrl) return;
    
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    
    // Event listeners
    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setIsLoading(false);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      stopProgressTracking();
    };
    const handleError = () => {
      setIsLoading(false);
      console.error('Audio loading error');
    };
    
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    
    // Set initial volume and playback rate
    audio.volume = volume;
    audio.playbackRate = playbackRate;
    
    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      
      audio.pause();
      audio.src = '';
    };
  }, [audioUrl, volume, playbackRate]);
  
  // Start tracking progress
  const startProgressTracking = useCallback(() => {
    progressIntervalRef.current = setInterval(() => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
    }, 100);
  }, []);
  
  // Stop tracking progress
  const stopProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);
  
  // Play audio
  const play = useCallback(async () => {
    if (!audioRef.current) return;
    
    try {
      await audioRef.current.play();
      setIsPlaying(true);
      startProgressTracking();
    } catch (error) {
      console.error('Play error:', error);
    }
  }, [startProgressTracking]);
  
  // Pause audio
  const pause = useCallback(() => {
    if (!audioRef.current) return;
    
    audioRef.current.pause();
    setIsPlaying(false);
    stopProgressTracking();
  }, [stopProgressTracking]);
  
  // Toggle play/pause
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);
  
  // Seek to specific time
  const seekTo = useCallback((time) => {
    if (!audioRef.current) return;
    
    audioRef.current.currentTime = Math.max(0, Math.min(time, duration));
    setCurrentTime(audioRef.current.currentTime);
  }, [duration]);
  
  // Seek by percentage (0-1)
  const seekToPercentage = useCallback((percentage) => {
    const time = duration * Math.max(0, Math.min(percentage, 1));
    seekTo(time);
  }, [duration, seekTo]);
  
  // Change volume (0-1)
  const changeVolume = useCallback((newVolume) => {
    const clampedVolume = Math.max(0, Math.min(newVolume, 1));
    setVolume(clampedVolume);
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
  }, []);
  
  // Change playback rate
  const changePlaybackRate = useCallback((rate) => {
    const clampedRate = Math.max(0.25, Math.min(rate, 2));
    setPlaybackRate(clampedRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = clampedRate;
    }
  }, []);
  
  // Stop and reset
  const stop = useCallback(() => {
    pause();
    seekTo(0);
  }, [pause, seekTo]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopProgressTracking();
    };
  }, [stopProgressTracking]);
  
// In the useAudioPlayer hook, update the formatAudioTime usage:

return {
  // State
  isPlaying,
  currentTime: isNaN(currentTime) ? 0 : currentTime, // 🔧 Prevent NaN
  duration: isNaN(duration) ? 0 : duration, // 🔧 Prevent NaN
  isLoading,
  volume,
  playbackRate,
  
  // Actions
  play,
  pause,
  togglePlay,
  stop,
  seekTo,
  seekToPercentage,
  changeVolume,
  changePlaybackRate,
  
  // Computed values
  progress: duration > 0 && !isNaN(currentTime) && !isNaN(duration) ? currentTime / duration : 0,
  currentTimeFormatted: formatAudioTime(isNaN(currentTime) ? 0 : currentTime),
  durationFormatted: formatAudioTime(isNaN(duration) ? 0 : duration),
  remainingTime: !isNaN(duration) && !isNaN(currentTime) ? Math.max(0, duration - currentTime) : 0,
  remainingTimeFormatted: formatAudioTime(!isNaN(duration) && !isNaN(currentTime) ? Math.max(0, duration - currentTime) : 0)
};
};