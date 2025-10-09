const config = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  
  // Maximum file size (10MB)
  MAX_FILE_SIZE: 10485760,
  
  // Supported file types
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'application/pdf',
    'text/plain',
    'text/markdown',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  
  // File type display names
  TYPE_NAMES: {
    'image/jpeg': 'JPEG Image',
    'image/jpg': 'JPG Image',
    'image/png': 'PNG Image',
    'image/gif': 'GIF Image',
    'image/webp': 'WebP Image',
    'image/svg+xml': 'SVG Image',
    'application/pdf': 'PDF Document',
    'text/plain': 'Text File',
    'text/markdown': 'Markdown',
    'application/msword': 'Word Document',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document',
  }
};

export default config;