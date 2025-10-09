const { analyzeImage } = require('./imageAnalysis');
const { analyzeText } = require('./textAnalysis');
const { ALLOWED_IMAGE_TYPES, ALLOWED_DOCUMENT_TYPES } = require('../utils/constants');

/**
 * Main function to route file analysis based on type
 * @param {string} filePath - Path to file
 * @param {string} mimetype - File MIME type
 * @returns {Promise<Object>} Analysis results
 */
const analyzeFile = async (filePath, mimetype) => {
  try {
    console.log(`Starting AI analysis for file type: ${mimetype}`);

    // Route to appropriate analyzer
    if (ALLOWED_IMAGE_TYPES.includes(mimetype)) {
      return await analyzeImage(filePath, mimetype);
    } 
    else if (ALLOWED_DOCUMENT_TYPES.includes(mimetype)) {
      return await analyzeText(filePath, mimetype);
    } 
    else {
      // Unsupported file type
      console.warn(`Unsupported file type for analysis: ${mimetype}`);
      return {
        tags: ['file', 'unsupported'],
        summary: 'File uploaded successfully (type not supported for AI analysis)',
        confidence: 0
      };
    }
  } catch (error) {
    console.error('AI analysis error:', error);
    
    // Return graceful fallback
    return {
      tags: ['file', 'error'],
      summary: 'File uploaded successfully (analysis failed)',
      confidence: 0,
      error: error.message
    };
  }
};

/**
 * Check if file type is supported for AI analysis
 * @param {string} mimetype - File MIME type
 * @returns {boolean}
 */
const isAnalysisSupported = (mimetype) => {
  return ALLOWED_IMAGE_TYPES.includes(mimetype) || 
         ALLOWED_DOCUMENT_TYPES.includes(mimetype);
};

/**
 * Get file category based on mimetype
 * @param {string} mimetype - File MIME type
 * @returns {string}
 */
const getFileCategory = (mimetype) => {
  if (ALLOWED_IMAGE_TYPES.includes(mimetype)) {
    return 'image';
  } else if (mimetype === 'application/pdf') {
    return 'pdf';
  } else if (ALLOWED_DOCUMENT_TYPES.includes(mimetype)) {
    return 'document';
  }
  return 'unknown';
};

module.exports = {
  analyzeFile,
  isAnalysisSupported,
  getFileCategory
};