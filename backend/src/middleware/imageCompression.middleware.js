import sharp from "sharp";
import path from "path";
import fs from "fs";

// Safe file cleanup helper
const safeFileCleanup = async (filePath, maxRetries = 3) => {
  if (!filePath || !fs.existsSync(filePath)) return;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      fs.unlinkSync(filePath);
      return;
    } catch (error) {
      if (error.code === 'EPERM' && i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, (i + 1) * 100));
      } else {
        console.warn('⚠️ Could not delete file during compression:', error.message);
        return;
      }
    }
  }
};

export const compressImage = async (req, res, next) => {
  // Only process image files
  if (!req.file || !req.file.mimetype.startsWith('image/')) {
    return next();
  }

  try {
    const inputPath = req.file.path;
    const outputPath = path.join('uploads', 'compressed-' + req.file.filename);
    
    // Get original image metadata
    const metadata = await sharp(inputPath).metadata();
    const originalSize = req.file.size;
    
    // Dynamic compression based on file size
    let quality = 85;
    let maxWidth = 1920;
    
    if (originalSize > 10 * 1024 * 1024) { // > 10MB - aggressive compression
      quality = 60;
      maxWidth = 1280;
    } else if (originalSize > 5 * 1024 * 1024) { // > 5MB - medium compression
      quality = 70;
      maxWidth = 1600;
    } else if (originalSize > 2 * 1024 * 1024) { // > 2MB - light compression
      quality = 80;
      maxWidth = 1920;
    }

    // Compress image with Sharp
    const compressedBuffer = await sharp(inputPath)
      .resize(maxWidth, null, { 
        withoutEnlargement: true,
        fit: 'inside'
      })
      .jpeg({ 
        quality, 
        progressive: true,
        mozjpeg: true
      })
      .toBuffer();

    // Write compressed image
    fs.writeFileSync(outputPath, compressedBuffer);
    const compressedSize = compressedBuffer.length;
    
    // Use compressed version if it's significantly smaller
    if (compressedSize < originalSize * 0.9) { // At least 10% size reduction
      // 🔥 FIX: Safe cleanup instead of direct unlink
      await safeFileCleanup(inputPath);
      
      // Update file info
      req.file.path = outputPath;
      req.file.filename = 'compressed-' + req.file.filename;
      req.file.size = compressedSize;
      req.file.isCompressed = true;
      req.file.compressionRatio = parseFloat(((originalSize - compressedSize) / originalSize * 100).toFixed(1));
      
      console.log(`✅ Image compressed: ${req.file.compressionRatio}% size reduction`);
    } else {
      // 🔥 FIX: Safe cleanup
      await safeFileCleanup(outputPath);
      req.file.isCompressed = false;
      req.file.compressionRatio = 0;
    }

    // Add dimensions to file info
    req.file.dimensions = {
      width: metadata.width,
      height: metadata.height
    };

    next();
  } catch (error) {
    console.error('Image compression error:', error);
    req.file.isCompressed = false;
    req.file.compressionRatio = 0;
    next(); // Continue without compression
  }
};