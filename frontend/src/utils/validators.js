// src/utils/validators.js - File Validation Functions
import config from '../config';

/**
 * Validate file type
 * @param {File} file - File to validate
 * @returns {Object} { valid: boolean, error: string }
 */
export const validateFileType = (file) => {
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }
  
  if (!config.ALLOWED_TYPES.includes(file.type)) {
    const allowedExtensions = config.ALLOWED_TYPES
      .map(type => config.TYPE_NAMES[type] || type)
      .join(', ');
    return {
      valid: false,
      error: `File type not supported. Allowed types: ${allowedExtensions}`
    };
  }
  
  return { valid: true, error: null };
};

/**
 * Validate file size
 * @param {File} file - File to validate
 * @returns {Object} { valid: boolean, error: string }
 */
export const validateFileSize = (file) => {
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }
  
  if (file.size > config.MAX_FILE_SIZE) {
    const maxSizeMB = (config.MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      error: `File too large. Maximum size is ${maxSizeMB}MB`
    };
  }
  
  if (file.size === 0) {
    return { valid: false, error: 'File is empty' };
  }
  
  return { valid: true, error: null };
};

/**
 * Validate file (both type and size)
 * @param {File} file - File to validate
 * @returns {Object} { valid: boolean, error: string }
 */
export const validateFile = (file) => {
  // Check file type
  const typeValidation = validateFileType(file);
  if (!typeValidation.valid) {
    return typeValidation;
  }
  
  // Check file size
  const sizeValidation = validateFileSize(file);
  if (!sizeValidation.valid) {
    return sizeValidation;
  }
  
  return { valid: true, error: null };
};

/**
 * Validate multiple files
 * @param {FileList|Array} files - Files to validate
 * @returns {Object} { valid: boolean, errors: Array, validFiles: Array }
 */
export const validateFiles = (files) => {
  const errors = [];
  const validFiles = [];
  
  Array.from(files).forEach((file, index) => {
    const validation = validateFile(file);
    
    if (validation.valid) {
      validFiles.push(file);
    } else {
      errors.push({
        fileName: file.name,
        error: validation.error,
        index
      });
    }
  });
  
  return {
    valid: errors.length === 0,
    errors,
    validFiles
  };
};