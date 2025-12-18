// services/jobQueue.js - Job Queue for Asynchronous AI Processing
const Queue = require('bull');
const { analyzeFile } = require('./aiAnalysis');
const File = require('../models/File');

// Create queue connected to Redis
const aiAnalysisQueue = new Queue('ai-analysis', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  },
  defaultJobOptions: {
    attempts: 3,  // Retry failed jobs 3 times
    backoff: {
      type: 'exponential',
      delay: 2000  // Start with 2s, then 4s, then 8s
    },
    removeOnComplete: true,  // Remove completed jobs from queue (saves memory)
    removeOnFail: false      // Keep failed jobs for debugging
  }
});

// Process jobs from the queue
aiAnalysisQueue.process(async (job) => {
  const { fileId, filePath, mimetype } = job.data;

  console.log(`Processing AI analysis for file: ${fileId}`);

  try {
    // Update progress
    job.progress(10);

    // Run AI analysis
    const aiResults = await analyzeFile(filePath, mimetype);

    // Update progress
    job.progress(80);

    // Update file in database with AI results
    await File.findByIdAndUpdate(fileId, {
      aiTags: aiResults.tags || [],
      summary: aiResults.summary || '',
      analyzed: true,
      analysisDate: new Date(),
      analysisError: null
    });

    // Update progress
    job.progress(100);

    console.log(`AI analysis completed for file: ${fileId}`);
    console.log(`   Tags: ${aiResults.tags?.join(', ')}`);

    return {
      fileId,
      success: true,
      tags: aiResults.tags,
      summary: aiResults.summary
    };

  } catch (error) {
    console.error(`AI analysis failed for file ${fileId}:`, error.message);

    // Save error to database
    await File.findByIdAndUpdate(fileId, {
      analyzed: false,
      analysisError: error.message
    });

    throw error;  // Throw to trigger retry
  }
});

// Event handlers
aiAnalysisQueue.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed successfully`);
  console.log(`   File: ${result.fileId}`);
});

aiAnalysisQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed after ${job.attemptsMade} attempts`);
  console.error(`   Error: ${err.message}`);
});

aiAnalysisQueue.on('progress', (job, progress) => {
  console.log(`Job ${job.id} progress: ${progress}%`);
});

aiAnalysisQueue.on('stalled', (job) => {
  console.warn(`Job ${job.id} stalled (taking too long)`);
});

// Helper function to add job to queue
const addAnalysisJob = async (fileId, filePath, mimetype, options = {}) => {
  try {
    const job = await aiAnalysisQueue.add(
      {
        fileId,
        filePath,
        mimetype
      },
      {
        priority: options.priority || 1,  // Lower number = higher priority
        attempts: options.attempts || 3,
        ...options
      }
    );

    console.log(`Added job ${job.id} to queue for file: ${fileId}`);
    return job;

  } catch (error) {
    console.error('Failed to add job to queue:', error);
    throw error;
  }
};

// Helper function to get queue statistics
const getQueueStats = async () => {
  try {
    const [waiting, active, completed, failed] = await Promise.all([
      aiAnalysisQueue.getWaitingCount(),
      aiAnalysisQueue.getActiveCount(),
      aiAnalysisQueue.getCompletedCount(),
      aiAnalysisQueue.getFailedCount()
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      total: waiting + active + completed + failed
    };
  } catch (error) {
    console.error('Failed to get queue stats:', error);
    return null;
  }
};

// Helper function to clean old jobs
const cleanQueue = async () => {
  try {
    // Remove completed jobs older than 1 day
    await aiAnalysisQueue.clean(24 * 3600 * 1000, 'completed');
    
    // Remove failed jobs older than 7 days
    await aiAnalysisQueue.clean(7 * 24 * 3600 * 1000, 'failed');
    
    console.log('Queue cleaned successfully');
  } catch (error) {
    console.error('Failed to clean queue:', error);
  }
};

// Graceful shutdown
const closeQueue = async () => {
  try {
    await aiAnalysisQueue.close();
    console.log('Queue closed successfully');
  } catch (error) {
    console.error('Failed to close queue:', error);
  }
};

module.exports = {
  aiAnalysisQueue,
  addAnalysisJob,
  getQueueStats,
  cleanQueue,
  closeQueue
};