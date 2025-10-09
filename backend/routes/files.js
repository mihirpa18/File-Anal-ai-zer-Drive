const express = require('express');
const router = express.Router();
const File = require('../models/File');
const { upload, handleMulterError } = require('../middleware/upload');
const { analyzeFile } = require('../services/aiAnalysis');
const { deleteFile } = require('../services/fileHandler');
const path = require('path');

/**
 * @route   POST /api/files/upload
 * @desc    Upload a file and analyze it with AI
 * @access  Public
 */
router.post('/upload', upload.single('file'), handleMulterError, async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    console.log(`File uploaded: ${req.file.originalname}`);

    // Create file record in database
    const newFile = new File({
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
      analyzed: false
    });

    await newFile.save();
    console.log(`File saved to database: ${newFile._id}`);

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
      // Don't fail the upload if AI analysis fails
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
 * @desc    Get all files with optional filtering
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { tag, sort = '-uploadDate', limit = 100 } = req.query;

    // Build query
    let query = {};
    
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
 * @desc    Get single file by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
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
 * @desc    Download file
 * @access  Public
 */
router.get('/download/:id', async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
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
 * @desc    Delete file
 * @access  Public
 */
router.delete('/:id', async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Delete file from disk
    await deleteFile(file.path);

    // Delete from database
    await File.findByIdAndDelete(req.params.id);

    console.log(`🗑️  Deleted file: ${file.originalName}`);

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
 * @desc    Get all unique tags
 * @access  Public
 */
router.get('/search/tags', async (req, res) => {
  try {
    // Get all unique tags from all files
    const tags = await File.distinct('aiTags');
    
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
 * @desc    Get storage statistics
 * @access  Public
 */
router.get('/stats/summary', async (req, res) => {
  try {
    const totalFiles = await File.countDocuments();
    const totalSize = await File.aggregate([
      { $group: { _id: null, total: { $sum: '$size' } } }
    ]);
    
    const analyzedFiles = await File.countDocuments({ analyzed: true });
    const imageFiles = await File.countDocuments({ 
      mimetype: { $regex: '^image/' } 
    });
    const documentFiles = await File.countDocuments({ 
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