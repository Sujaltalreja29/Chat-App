// Audio recording configuration
export const AUDIO_CONFIG = {
  // Recording settings
  SAMPLE_RATE: 44100,
  CHANNELS: 1, // Mono for voice notes
  BIT_DEPTH: 16,
  
  // Recording constraints
  MAX_DURATION: 180, // 3 minutes in seconds
  MIN_DURATION: 1,   // 1 second minimum
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  
  // Waveform settings
  WAVEFORM_SAMPLES: 150,
  UPDATE_INTERVAL: 50,
  
  // Audio formats (in order of preference)
  PREFERRED_FORMATS: [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4',
    'audio/wav'
  ],
  
  // Browser compatibility
  SUPPORTED_MIME_TYPES: [
    'audio/webm',
    'audio/ogg',
    'audio/mp4',
    'audio/wav',
    'audio/mpeg'
  ]
};

// Get the best supported audio format for current browser
export const getBestAudioFormat = () => {
  if (!window.MediaRecorder) {
    return null;
  }
  
  for (const format of AUDIO_CONFIG.PREFERRED_FORMATS) {
    if (MediaRecorder.isTypeSupported(format)) {
      return format;
    }
  }
  
  return 'audio/webm'; // Fallback
};

// Format time display
export const formatAudioTime = (seconds) => {
  // 🔧 FIXED: Handle NaN, undefined, null, and invalid values
  if (!seconds || isNaN(seconds) || seconds < 0) {
    return '0:00';
  }
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  
  // 🔧 Additional safety checks
  if (isNaN(mins) || isNaN(secs)) {
    return '0:00';
  }
  
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Convert blob to base64 (if needed)
export const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};