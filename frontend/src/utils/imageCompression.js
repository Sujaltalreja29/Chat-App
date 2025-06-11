import imageCompression from 'browser-image-compression';

export const compressImage = async (imageFile) => {
  try {
    const options = {
      maxSizeMB: 2, // Compress to max 2MB
      maxWidthOrHeight: 1920, // Max resolution
      useWebWorker: true,
      fileType: 'image/jpeg', // Convert to JPEG for better compression
      quality: 0.8 // 80% quality
    };

    // Only compress if file is larger than 1MB
    if (imageFile.size <= 1024 * 1024) {
      return imageFile;
    }

    const compressedFile = await imageCompression(imageFile, options);
    
    // Create a new File object with original name but compressed content
    const finalFile = new File(
      [compressedFile], 
      imageFile.name.replace(/\.[^/.]+$/, '.jpg'), // Change extension to .jpg
      { 
        type: 'image/jpeg',
        lastModified: Date.now()
      }
    );

    console.log(`Original size: ${(imageFile.size / 1024 / 1024).toFixed(2)}MB`);
    console.log(`Compressed size: ${(finalFile.size / 1024 / 1024).toFixed(2)}MB`);

    return finalFile;
  } catch (error) {
    console.error('Image compression failed:', error);
    return imageFile; // Return original if compression fails
  }
};