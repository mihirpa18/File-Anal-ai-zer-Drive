
// Maximum file size (10MB in bytes)
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 10485760;

// Allowed file types
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp'
];

const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'text/plain',
  'text/markdown'
];

const ALLOWED_MIMETYPES = [
  ...ALLOWED_IMAGE_TYPES,
  ...ALLOWED_DOCUMENT_TYPES
];

// Google Gemini API model name
const GEMINI_MODEL = 'gemini-2.5-flash'; 

module.exports = {
  MAX_FILE_SIZE,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_DOCUMENT_TYPES,
  ALLOWED_MIMETYPES,
  GEMINI_MODEL,
};