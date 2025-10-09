const fs = require('fs').promises;
const path = require('path');

/**
 * Read file from disk
 * @param {string} filePath - Path to file
 * @returns {Promise<Buffer>} File buffer
 */
const readFile = async (filePath) => {
  try {
    const buffer = await fs.readFile(filePath);
    return buffer;
  } catch (error) {
    throw new Error(`Failed to read file: ${error.message}`);
  }
};

/**
 * Delete file from disk
 * @param {string} filePath - Path to file
 * @returns {Promise<void>}
 */
const deleteFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
    console.log(`Deleted file: ${filePath}`);
  } catch (error) {
    // Don't throw error if file doesn't exist
    if (error.code !== 'ENOENT') {
      console.error(`Error deleting file: ${error.message}`);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }
};

/**
 * Check if file exists
 * @param {string} filePath - Path to file
 * @returns {Promise<boolean>}
 */
const fileExists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get file stats
 * @param {string} filePath - Path to file
 * @returns {Promise<Object>}
 */
const getFileStats = async (filePath) => {
  try {
    const stats = await fs.stat(filePath);
    return stats;
  } catch (error) {
    throw new Error(`Failed to get file stats: ${error.message}`);
  }
};

/**
 * Read text file content
 * @param {string} filePath - Path to text file
 * @returns {Promise<string>}
 */
const readTextFile = async (filePath) => {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    throw new Error(`Failed to read text file: ${error.message}`);
  }
};

module.exports = {
  readFile,
  deleteFile,
  fileExists,
  getFileStats,
  readTextFile
};