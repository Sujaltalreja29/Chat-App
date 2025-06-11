export const FILE_TYPES = {
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  DOCUMENT: 'document',
  OTHER: 'other'
};

export const SUPPORTED_FILE_TYPES = {
  [FILE_TYPES.IMAGE]: [
    'image/jpeg',
    'image/png', 
    'image/gif',
    'image/webp'
  ],
  [FILE_TYPES.VIDEO]: [
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo'
  ],
  [FILE_TYPES.AUDIO]: [
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/mp4'
  ],
  [FILE_TYPES.DOCUMENT]: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ]
};

export const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

// 🔥 ENHANCED: Better file type indicators for sidebar
export const FILE_TYPE_DISPLAY = {
  [FILE_TYPES.IMAGE]: {
    icon: '📷',
    label: 'Photo',
    color: 'text-green-600'
  },
  [FILE_TYPES.VIDEO]: {
    icon: '🎬',
    label: 'Video',
    color: 'text-purple-600'
  },
  [FILE_TYPES.AUDIO]: {
    icon: '🎵',
    label: 'Audio',
    color: 'text-blue-600'
  },
  [FILE_TYPES.DOCUMENT]: {
    icon: '📄',
    label: 'Document',
    color: 'text-red-600'
  },
  [FILE_TYPES.OTHER]: {
    icon: '📎',
    label: 'File',
    color: 'text-gray-600'
  }
};

// Helper function to get file display info
export const getFileDisplayInfo = (fileType) => {
  return FILE_TYPE_DISPLAY[fileType] || FILE_TYPE_DISPLAY[FILE_TYPES.OTHER];
};