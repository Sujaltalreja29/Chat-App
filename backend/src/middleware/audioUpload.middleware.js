import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure upload directory exists
const uploadDir = "uploads/audio/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, "voice-" + uniqueSuffix + "-" + sanitizedOriginalName);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept audio files only - prioritize efficient formats
  const allowedMimes = [
    'audio/webm',        // Most efficient for web
    'audio/ogg',         // Good compression
    'audio/mpeg',        // Standard MP3
    'audio/mp3',         // Standard MP3
    'audio/mp4',         // AAC format
    'audio/wav',         // Fallback (larger files)
    'audio/aac',         // Efficient compression
    'audio/x-wav',       // Alternative WAV mime type
    'audio/vnd.wav'      // Another WAV variant
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Only audio files are allowed.`), false);
  }
};

export const audioUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Only one file at a time
  }
});

// Enhanced error handling middleware for multer
export const handleAudioUploadError = (err, req, res, next) => {
  // Clean up any uploaded file on error
  if (req.file && req.file.path && fs.existsSync(req.file.path)) {
    try {
      fs.unlinkSync(req.file.path);
    } catch (cleanupError) {
      console.error("Failed to cleanup uploaded file:", cleanupError);
    }
  }

  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({ 
          error: 'Voice note too large. Maximum size is 5MB.' 
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({ 
          error: 'Only one voice note at a time.' 
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({ 
          error: 'Unexpected file field.' 
        });
      case 'LIMIT_FIELD_KEY':
        return res.status(400).json({ 
          error: 'Field name too long.' 
        });
      case 'LIMIT_FIELD_VALUE':
                return res.status(400).json({ 
          error: 'Field value too long.' 
        });
      case 'LIMIT_FIELD_COUNT':
        return res.status(400).json({ 
          error: 'Too many fields.' 
        });
      default:
        return res.status(400).json({ 
          error: 'File upload error: ' + err.message 
        });
    }
  }
  
  if (err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({ 
      error: err.message
    });
  }
  
  console.error("Audio upload error:", err);
  res.status(500).json({ 
    error: 'File upload failed. Please try again.' 
  });
};

// Middleware to validate audio upload request
export const validateAudioUpload = (req, res, next) => {
  const { duration } = req.body;
  
  // Validate duration is provided
  if (!duration) {
    return res.status(400).json({ 
      error: 'Duration is required for voice notes' 
    });
  }
  
  // Validate duration is a valid number
  const durationNum = parseInt(duration);
  if (isNaN(durationNum) || durationNum <= 0) {
    return res.status(400).json({ 
      error: 'Duration must be a positive number' 
    });
  }
  
  // Validate duration is within limits
  if (durationNum > 300) { // 5 minutes
    return res.status(400).json({ 
      error: 'Voice note too long. Maximum duration is 5 minutes' 
    });
  }
  
  next();
};