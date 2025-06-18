import { promises as fs } from 'fs';
import path from 'path';

/**
 * Get audio file metadata without heavy dependencies
 * @param {string} filePath - Path to audio file
 * @returns {Promise<Object>} Audio metadata
 */
export const getAudioMetadata = async (filePath) => {
  try {
    const stats = await fs.stat(filePath);
    
    return {
      size: stats.size,
      lastModified: stats.mtime,
      // Duration will be sent from frontend
      isValid: await validateAudioFile(filePath)
    };
  } catch (error) {
    console.error('Error getting audio metadata:', error);
    return null;
  }
};

/**
 * Validate audio file (basic checks)
 * @param {string} filePath - Path to audio file
 * @returns {Promise<boolean>} Is valid audio file
 */
export const validateAudioFile = async (filePath) => {
  try {
    const stats = await fs.stat(filePath);
    
    // Basic validations
    const maxSize = 10 * 1024 * 1024; // 10MB
    const minSize = 100; // 100 bytes
    
    if (stats.size > maxSize || stats.size < minSize) {
      return false;
    }
    
    // Check file extension
    const validExtensions = ['.mp3', '.wav', '.ogg', '.webm', '.m4a', '.aac'];
    const ext = path.extname(filePath).toLowerCase();
    
    return validExtensions.includes(ext);
  } catch (error) {
    return false;
  }
};

/**
 * Clean up temporary audio files
 * @param {string} filePath - Path to file to delete
 */
export const cleanupAudioFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
    console.log(`Cleaned up audio file: ${filePath}`);
  } catch (error) {
    console.error(`Error cleaning up audio file: ${filePath}`, error);
  }
};

/**
 * Validate waveform data
 * @param {Array} waveformData - Array of amplitude values
 * @returns {boolean} Is valid waveform
 */
export const validateWaveform = (waveformData) => {
  if (!Array.isArray(waveformData)) return false;
  if (waveformData.length === 0) return true; // Empty is okay
  if (waveformData.length > 1000) return false; // Too many points
  
  // Check if all values are numbers between 0 and 1
  return waveformData.every(value => 
    typeof value === 'number' && value >= 0 && value <= 1
  );
};

/**
 * Generate audio file name
 * @param {string} originalName - Original file name
 * @param {string} userId - User ID
 * @returns {string} Generated file name
 */
export const generateAudioFileName = (originalName, userId) => {
  const timestamp = Date.now();
  const random = Math.round(Math.random() * 1000);
  const ext = path.extname(originalName) || '.webm';
  
  return `voice_${userId}_${timestamp}_${random}${ext}`;
};