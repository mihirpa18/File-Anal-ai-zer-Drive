const express = require('express');
const router = express.Router();
const File = require('../models/File');
const { upload, handleMulterError } = require('../middleware/upload');
const { deleteFile } = require('../services/fileHandler');
const { protect } = require('../middleware/auth');
const path = require('path');
const { addAnalysisJob, getQueueStats } = require('../services/jobQueue');

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

    // Create file record in database
    const newFile = new File({
      userId: req.userId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
      analyzed: false  // Will be analyzed asynchronously
    });

    await newFile.save();
    console.log(`File saved to database: ${newFile._id}`);

    // Add job to queue for async AI analysis (non-blocking)
    try {
      await addAnalysisJob(newFile._id, req.file.path, req.file.mimetype, {
        priority: 1  // Higher priority for new uploads
      });

      // Return immediately - don't wait for AI analysis
      res.status(201).json({
        success: true,
        message: 'File uploaded successfully! AI analysis in progress...',
        data: newFile
      });

    } catch (queueError) {
      console.error('Failed to queue AI analysis:', queueError);
      
      // File is still uploaded, just analysis failed to queue
      res.status(201).json({
        success: true,
        message: 'File uploaded successfully (AI analysis pending)',
        data: newFile,
        warning: 'AI analysis could not be queued'
      });
    }

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
    
    const pendingFiles = await File.countDocuments({
      userId: req.userId,
      analyzed: false
    });
    
    const imageFiles = await File.countDocuments({ 
      userId: req.userId,
      mimetype: { $regex: '^image/' } 
    });
    
    const documentFiles = await File.countDocuments({ 
      userId: req.userId,
      mimetype: { $regex: '^(application|text)/' } 
    });

    // Get queue stats
    const queueStats = await getQueueStats();

    res.json({
      success: true,
      data: {
        totalFiles,
        totalSize: totalSize[0]?.total || 0,
        analyzedFiles,
        pendingFiles,
        imageFiles,
        documentFiles,
        analysisRate: totalFiles > 0 ? (analyzedFiles / totalFiles * 100).toFixed(1) : 0,
        queueStats: queueStats || {
          waiting: 0,
          active: 0,
          completed: 0,
          failed: 0
        }
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


/**
 * @route   GET /api/files/queue/status
 * @desc    Get job queue status
 * @access  Private
 */
router.get('/queue/status', protect, async (req, res) => {
  try {
    const stats = await getQueueStats();

    if (!stats) {
      return res.status(500).json({
        success: false,
        message: 'Failed to get queue stats'
      });
    }

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get queue status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve queue status',
      error: error.message
    });
  }
});

module.exports = router;