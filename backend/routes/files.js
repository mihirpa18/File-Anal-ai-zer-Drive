const express = require('express');
const router = express.Router();
const File = require('../models/File');
const { upload, handleMulterError } = require('../middleware/upload');
const { analyzeFile } = require('../services/aiAnalysis');
const { deleteFile } = require('../services/fileHandler');
const { protect } = require('../middleware/auth');
const path = require('path');

/**
 * @route   POST /api/files/upload
 * @desc    Upload a file and analyze it with AI
 * @access  Private (requires authentication)
 */
router.post('/upload', protect, upload.single('file'), handleMulterError, async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    console.log(`File uploaded by user ${req.user.email}: ${req.file.originalname}`);

    // Create file record in database with userId
    const newFile = new File({
      userId: req.userId, // From auth middleware
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
      analyzed: false
    });

    await newFile.save();
    console.log(`File saved to database: ${newFile.filename}`);

    // Analyze file with AI (synchronously for simplicity)
    try {
      const aiResults = await analyzeFile(req.file.path, req.file.mimetype);
      
      // Update file with AI results
      newFile.aiTags = aiResults.tags || [];
      newFile.summary = aiResults.summary || '';
      newFile.analyzed = true;
      newFile.analysisDate = new Date();
      
      if (aiResults.error) {
        newFile.analysisError = aiResults.error;
      }
      
      await newFile.save();
      console.log(`AI analysis complete for: ${newFile._id}`);
    } catch (aiError) {
      console.error('AI analysis failed:', aiError.message);
      newFile.analysisError = aiError.message;
      await newFile.save();
    }

    // Return file with AI results
    res.status(201).json({
      success: true,
      message: 'File uploaded and analyzed successfully',
      data: newFile
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload file',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/files
 * @desc    Get all files for current user
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    const { tag, sort = '-uploadDate', limit = 100 } = req.query;

    // Build query - ONLY for current user
    let query = { userId: req.userId };
    
    // Filter by tag if provided
    if (tag) {
      query.aiTags = { $in: [tag.toLowerCase()] };
    }

    // Execute query
    const files = await File.find(query)
      .sort(sort)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: files.length,
      data: files
    });

  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve files',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/files/:id
 * @desc    Get single file by ID (only if owned by user)
 * @access  Private
 */
router.get('/:id', protect, async (req, res) => {
  try {
    // Find file that belongs to current user
    const file = await File.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found or access denied'
      });
    }

    res.json({
      success: true,
      data: file
    });

  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve file',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/files/download/:id
 * @desc    Download file (only if owned by user)
 * @access  Private
 */
router.get('/download/:id', protect, async (req, res) => {
  try {
    // Find file that belongs to current user
    const file = await File.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found or access denied'
      });
    }

    // Send file for download
    res.download(file.path, file.originalName, (err) => {
      if (err) {
        console.error('Download error:', err);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: 'Failed to download file'
          });
        }
      }
    });

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download file',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/files/:id
 * @desc    Delete file (only if owned by user)
 * @access  Private
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    // Find file that belongs to current user
    const file = await File.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found or access denied'
      });
    }

    // Delete file from disk
    await deleteFile(file.path);

    // Delete from database
    await File.findByIdAndDelete(req.params.id);

    console.log(`User ${req.user.email} deleted file: ${file.originalName}`);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/files/search/tags
 * @desc    Get all unique tags for current user
 * @access  Private
 */
router.get('/search/tags', protect, async (req, res) => {
  try {
    // Get all unique tags from user's files
    const tags = await File.distinct('aiTags', { userId: req.userId });
    
    // Sort alphabetically
    tags.sort();

    res.json({
      success: true,
      count: tags.length,
      data: tags
    });

  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve tags',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/files/stats/summary
 * @desc    Get storage statistics for current user
 * @access  Private
 */
router.get('/stats/summary', protect, async (req, res) => {
  try {
    const totalFiles = await File.countDocuments({ userId: req.userId });
    
    const totalSize = await File.aggregate([
      { $match: { userId: req.userId } },
      { $group: { _id: null, total: { $sum: '$size' } } }
    ]);
    
    const analyzedFiles = await File.countDocuments({ 
      userId: req.userId,
      analyzed: true 
    });
    
    const imageFiles = await File.countDocuments({ 
      userId: req.userId,
      mimetype: { $regex: '^image/' } 
    });
    
    const documentFiles = await File.countDocuments({ 
      userId: req.userId,
      mimetype: { $regex: '^(application|text)/' } 
    });

    res.json({
      success: true,
      data: {
        totalFiles,
        totalSize: totalSize[0]?.total || 0,
        analyzedFiles,
        imageFiles,
        documentFiles,
        analysisRate: totalFiles > 0 ? (analyzedFiles / totalFiles * 100).toFixed(1) : 0
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve statistics',
      error: error.message
    });
  }
});

module.exports = router;