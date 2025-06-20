import multer from "multer";
import path from "path";
import fs from "fs";
import sharp from "sharp";

// Ensure upload directory exists
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Enhanced file filter with better validation
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    image: [
      'image/jpeg', 
      'image/jpg', 
      'image/png', 
      'image/gif', 
      'image/webp',
      'image/bmp',
      'image/tiff'
    ],
    document: [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv',
      'application/rtf'
    ],
    video: [
      'video/mp4', 
      'video/quicktime', 
      'video/x-msvideo',
      'video/webm',
      'video/ogg'
    ],
    audio: [
      'audio/mpeg', 
      'audio/wav', 
      'audio/ogg', 
      'audio/mp4',
      'audio/aac',
      'audio/webm'
    ]
  };

  const allAllowedTypes = Object.values(allowedTypes).flat();
  
  if (allAllowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} not allowed`), false);
  }
};

// Configure storage with better naming
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const ext = path.extname(sanitizedName);
    const nameWithoutExt = path.basename(sanitizedName, ext);
    cb(null, `${getFileType(file.mimetype)}-${uniqueSuffix}-${nameWithoutExt}${ext}`);
  }
});

// Enhanced multer configuration
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit
    files: 1,
    fieldSize: 2 * 1024 * 1024, // 2MB for text fields
    fields: 10 // Limit number of fields
  }
});

// File type detector helper (enhanced)
export const getFileType = (mimeType) => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('pdf') || mimeType.includes('document') || 
      mimeType.includes('text') || mimeType.includes('sheet') ||
      mimeType.includes('presentation') || mimeType.includes('rtf')) return 'document';
  return 'other';
};

// File size formatter
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Enhanced error handling middleware
export const handleFileUploadError = (err, req, res, next) => {
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
          error: 'File too large. Maximum size is 25MB.' 
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({ 
          error: 'Only one file at a time.' 
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
  
  if (err.message && err.message.includes('not allowed')) {
    return res.status(400).json({ 
      error: err.message
    });
  }
  
  console.error("File upload error:", err);
  res.status(500).json({ 
    error: 'File upload failed. Please try again.' 
  });
};

// Image compression middleware
export const compressImage = async (req, res, next) => {
  if (!req.file || !req.file.mimetype.startsWith('image/')) {
    return next();
  }

  try {
    const { path: filePath, filename } = req.file;
    const compressedPath = path.join(uploadDir, `compressed-${filename}`);

    // Compress image using sharp
    const metadata = await sharp(filePath).metadata();
    
    let sharpInstance = sharp(filePath);
    
    // Resize if too large
    if (metadata.width > 1920 || metadata.height > 1920) {
      sharpInstance = sharpInstance.resize(1920, 1920, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }
    
    // Compress based on format
    if (req.file.mimetype === 'image/jpeg' || req.file.mimetype === 'image/jpg') {
      sharpInstance = sharpInstance.jpeg({ quality: 80, progressive: true });
    } else if (req.file.mimetype === 'image/png') {
      sharpInstance = sharpInstance.png({ quality: 80, compressionLevel: 8 });
    } else if (req.file.mimetype === 'image/webp') {
      sharpInstance = sharpInstance.webp({ quality: 80 });
    }
    
    await sharpInstance.toFile(compressedPath);
    
    // Get compressed file stats
    const compressedStats = fs.statSync(compressedPath);
    const originalStats = fs.statSync(filePath);
    
    // If compression saved significant space, use compressed version
    if (compressedStats.size < originalStats.size * 0.8) {
      // Replace original with compressed
      fs.unlinkSync(filePath);
      fs.renameSync(compressedPath, filePath);
      
      // Update file info
      req.file.size = compressedStats.size;
      req.file.isCompressed = true;
      req.file.compressionRatio = ((originalStats.size - compressedStats.size) / originalStats.size * 100).toFixed(2);
      req.file.dimensions = { width: metadata.width, height: metadata.height };
    } else {
      // Clean up compressed file if it didn't help
      if (fs.existsSync(compressedPath)) {
        fs.unlinkSync(compressedPath);
      }
      req.file.isCompressed = false;
      req.file.compressionRatio = 0;
    }

    next();
  } catch (error) {
    console.error("Image compression error:", error);
    // Don't fail the upload, just continue without compression
    req.file.isCompressed = false;
    req.file.compressionRatio = 0;
    next();
  }
};

// File validation middleware
export const validateFile = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file provided' });
  }

  // Check file size
  if (req.file.size > 25 * 1024 * 1024) {
    return res.status(400).json({ error: 'File too large. Maximum size is 25MB.' });
  }

  // Check if file exists
  if (!fs.existsSync(req.file.path)) {
    return res.status(400).json({ error: 'File upload failed' });
  }

  next();
};