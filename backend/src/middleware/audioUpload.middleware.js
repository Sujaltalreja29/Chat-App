import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, "voice-" + uniqueSuffix + path.extname(file.originalname));
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
    'audio/aac'          // Efficient compression
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only audio files are allowed.'), false);
  }
};

export const audioUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 🔧 Reduced to 5MB (cost-effective)
    files: 1 // Only one file at a time
  }
});

// Error handling middleware for multer
export const handleAudioUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'Voice note too large. Maximum size is 5MB.' 
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        error: 'Only one voice note at a time.' 
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ 
        error: 'Unexpected file field.' 
      });
    }
  }
  
  if (err.message.includes('Invalid file type')) {
    return res.status(400).json({ 
      error: 'Invalid file type. Only audio files are allowed.' 
    });
  }
  
  next(err);
};