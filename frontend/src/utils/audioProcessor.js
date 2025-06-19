// utils/audioProcessor.js - Advanced audio processing
export class AudioProcessor {
  constructor() {
    this.audioContext = null;
    this.sourceNode = null;
    this.destinationNode = null;
    this.gainNode = null;
    this.compressorNode = null;
    this.noiseGateNode = null;
    this.highPassFilter = null;
  }
  
  async setupAudioProcessing(inputStream) {
    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 48000,
        latency: 'interactive'
      });
      
      // Create source from input stream
      this.sourceNode = this.audioContext.createMediaStreamSource(inputStream);
      
      // 🔥 High-pass filter (removes low-frequency noise like AC hum)
      this.highPassFilter = this.audioContext.createBiquadFilter();
      this.highPassFilter.type = 'highpass';
      this.highPassFilter.frequency.setValueAtTime(80, this.audioContext.currentTime); // Remove below 80Hz
      this.highPassFilter.Q.setValueAtTime(0.7, this.audioContext.currentTime);
      
      // 🔥 Compressor (evens out volume levels)
      this.compressorNode = this.audioContext.createDynamicsCompressor();
      this.compressorNode.threshold.setValueAtTime(-24, this.audioContext.currentTime);
      this.compressorNode.knee.setValueAtTime(30, this.audioContext.currentTime);
      this.compressorNode.ratio.setValueAtTime(12, this.audioContext.currentTime);
      this.compressorNode.attack.setValueAtTime(0.003, this.audioContext.currentTime);
      this.compressorNode.release.setValueAtTime(0.25, this.audioContext.currentTime);
      
      // 🔥 Gain control
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.setValueAtTime(1.2, this.audioContext.currentTime);
      
      // 🔥 Create destination (output stream)
      this.destinationNode = this.audioContext.createMediaStreamDestination();
      
      // 🔥 Connect the audio processing chain
      this.sourceNode
        .connect(this.highPassFilter)
        .connect(this.compressorNode)
        .connect(this.gainNode)
        .connect(this.destinationNode);
      
      console.log('🎤 Audio processing pipeline established');
      return this.destinationNode.stream;
      
    } catch (error) {
      console.error('🎤 Audio processing setup failed:', error);
      return inputStream; // Fallback to original stream
    }
  }
  
  // 🔥 Simple noise gate (cuts audio below threshold)
  createNoiseGate(threshold = -50) {
    if (!this.audioContext) return;
    
    const scriptProcessor = this.audioContext.createScriptProcessor(4096, 1, 1);
    
    scriptProcessor.onaudioprocess = (event) => {
      const inputBuffer = event.inputBuffer;
      const outputBuffer = event.outputBuffer;
      const inputData = inputBuffer.getChannelData(0);
      const outputData = outputBuffer.getChannelData(0);
      
      for (let i = 0; i < inputBuffer.length; i++) {
        // Calculate volume in decibels
        const volume = 20 * Math.log10(Math.abs(inputData[i]));
        
        // Apply noise gate
        if (volume < threshold) {
          outputData[i] = 0; // Silence
        } else {
          outputData[i] = inputData[i];
        }
      }
    };
    
    return scriptProcessor;
  }
  
  // Cleanup
  cleanup() {
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
  }
}