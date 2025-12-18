require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const fileRoutes = require('./routes/files');
const authRoutes = require('./routes/auth'); 
const errorHandler = require('./middleware/errorHandler');
const path = require('path');
const fs = require('fs');
const { closeQueue, cleanQueue } = require('./services/jobQueue');


const app = express();
const PORT = process.env.PORT || 5000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadsDir));

// Connect to MongoDB
connectDB();

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Personal Cloud Storage API is running',
    timestamp: new Date().toISOString(),
    authentication: 'enabled'
  });
});

// Routes
app.use('/api/auth', authRoutes);  
app.use('/api/files', fileRoutes); 

// Error handling middleware (must be last)
app.use(errorHandler);

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Uploads directory: ${uploadsDir}`);
  console.log(`API Health: http://localhost:${PORT}/api/health`);
  console.log(`Authentication: Enabled`);
  console.log(`Job Queue: Enabled (Redis)`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});

// Clean queue periodically (every 24 hours)
setInterval(() => {
  cleanQueue();
}, 24 * 60 * 60 * 1000);

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  // Stop accepting new requests
  server.close(() => {
    console.log('HTTP server closed');
  });

  // Close job queue
  await closeQueue();
  
  // Close database connection
  await require('mongoose').connection.close();
  console.log('MongoDB connection closed');
  
  console.log('Graceful shutdown complete');
  process.exit(0);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});