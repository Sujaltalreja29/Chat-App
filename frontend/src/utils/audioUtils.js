import { AUDIO_CONFIG } from '../constants/audioConfig.js';

/**
 * Compress audio blob for efficient upload
 * @param {Blob} audioBlob - Original audio blob
 * @returns {Promise<Blob>} Compressed audio blob
 */
export const compressAudio = async (audioBlob) => {
  // For now, return original blob
  // Can add client-side compression later if needed
  return audioBlob;
};

/**
 * Generate waveform data from audio stream
 * @param {MediaStream} stream - Audio stream
 * @param {Function} callback - Callback for waveform updates
 * @returns {Object} Audio context and analyzer
 */
export const createWaveformAnalyzer = (stream, callback) => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyzer = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    
    // 🔧 Better settings for accurate waveform
    analyzer.fftSize = 1024; // Increased for better resolution
    analyzer.smoothingTimeConstant = 0.3; // More responsive
    analyzer.minDecibels = -100;
    analyzer.maxDecibels = -30;
    
    source.connect(analyzer);
    
    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const timeDataArray = new Uint8Array(analyzer.fftSize);
    
    const updateWaveform = () => {
      // 🔧 Use both frequency and time domain data for better accuracy
      analyzer.getByteFrequencyData(dataArray);
      analyzer.getByteTimeDomainData(timeDataArray);
      
      // Calculate amplitude from time domain (more accurate for voice)
      let sum = 0;
      let maxAmplitude = 0;
      
      for (let i = 0; i < timeDataArray.length; i++) {
        const amplitude = Math.abs(timeDataArray[i] - 128) / 128;
        sum += amplitude;
        maxAmplitude = Math.max(maxAmplitude, amplitude);
      }
      
      // Use both average and peak for better representation
      const avgAmplitude = sum / timeDataArray.length;
      const combinedAmplitude = (avgAmplitude * 0.7) + (maxAmplitude * 0.3);
      
      // 🔧 Better scaling for voice detection
      const scaledAmplitude = Math.min(Math.pow(combinedAmplitude * 2, 1.2), 1);
      
      // 🔧 Prevent NaN values
      const finalAmplitude = isNaN(scaledAmplitude) ? 0 : scaledAmplitude;
      
      callback(finalAmplitude);
    };
    
    return {
      audioContext,
      analyzer,
      updateWaveform,
      cleanup: () => {
        try {
          source.disconnect();
          audioContext.close();
        } catch (error) {
          console.error('Error cleaning up audio context:', error);
        }
      }
    };
  } catch (error) {
    console.error('Error creating waveform analyzer:', error);
    return null;
  }
};

/**
 * Get audio duration from blob
 * @param {Blob} audioBlob - Audio blob
 * @returns {Promise<number>} Duration in seconds
 */
export const getAudioDuration = (audioBlob) => {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.addEventListener('loadedmetadata', () => {
      resolve(audio.duration || 0);
    });
    audio.addEventListener('error', () => {
      resolve(0);
    });
    audio.src = URL.createObjectURL(audioBlob);
  });
};

/**
 * Check if browser supports audio recording
 * @returns {boolean} Is audio recording supported
 */
export const isAudioRecordingSupported = () => {
  return !!(navigator.mediaDevices && 
           navigator.mediaDevices.getUserMedia && 
           window.MediaRecorder);
};

/**
 * Request microphone permission
 * @returns {Promise<boolean>} Permission granted
 */
export const requestMicrophonePermission = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(track => track.stop()); // Stop immediately
    return true;
  } catch (error) {
    console.error('Microphone permission denied:', error);
    return false;
  }
};

/**
 * Validate audio file
 * @param {File} file - Audio file
 * @returns {boolean} Is valid audio file
 */
export const validateAudioFile = (file) => {
  // Check file type
  if (!AUDIO_CONFIG.SUPPORTED_MIME_TYPES.some(type => 
    file.type.includes(type.split('/')[1]))) {
    return false;
  }
  
  // Check file size
  if (file.size > AUDIO_CONFIG.MAX_FILE_SIZE) {
    return false;
  }
  
  return true;
};

/**
 * Format time in MM:SS format
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Convert blob to base64 (if needed)
 * @param {Blob} blob - Blob to convert
 * @returns {Promise<string>} Base64 string
 */
export const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Get optimal audio recording options for current browser
 * @returns {Object} MediaRecorder options
 */
export const getOptimalRecordingOptions = () => {
  const options = {
    audioBitsPerSecond: 64000, // 64kbps for efficiency
  };

  // Try to find the best supported format
  for (const format of AUDIO_CONFIG.PREFERRED_FORMATS) {
    if (MediaRecorder.isTypeSupported(format)) {
      options.mimeType = format;
      break;
    }
  }

  return options;
};

/**
 * Create audio constraints for getUserMedia
 * @returns {Object} Audio constraints
 */
export const getAudioConstraints = () => {
  return {
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      sampleRate: AUDIO_CONFIG.SAMPLE_RATE,
      channelCount: AUDIO_CONFIG.CHANNELS
    }
  };
};